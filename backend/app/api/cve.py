from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.cve import CVE
from app.models.user import User
from app.intel.sync import sync_vulnerability_database, calculate_priority_score

router = APIRouter(prefix="/cve", tags=["Vulnerability Intelligence"])

@router.get("/")
async def list_cves(
    q: Optional[str] = None,
    kev_only: bool = False,
    min_cvss: float = 0.0,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(CVE).where(CVE.cvss_score >= min_cvss)
    if kev_only:
        query = query.where(CVE.is_cisa_kev == True)
    if q:
        query = query.where(CVE.description.ilike(f"%{q}%") | CVE.cve_id.ilike(f"%{q}%"))

    query = query.order_by(CVE.cvss_score.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    cves = result.scalars().all()

    output = []
    for c in cves:
        priority = calculate_priority_score(c.cvss_score, c.is_cisa_kev, c.epss_score)
        output.append({
            "cve_id": c.cve_id,
            "cvss_score": c.cvss_score,
            "is_cisa_kev": c.is_cisa_kev,
            "epss_score": c.epss_score,
            "priority_score": priority,
            "description": c.description,
            "affected_cpe": c.affected_cpe,
            "patch_guidance": c.patch_guidance,
            "published_date": c.published_date.isoformat() if c.published_date else None,
            "cached_at": c.cached_at.isoformat() if c.cached_at else None
        })
    return output

@router.get("/{cve_id}")
async def get_cve(
    cve_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(CVE).where(CVE.cve_id == cve_id))
    cve = res.scalars().first()
    if not cve:
        raise HTTPException(status_code=404, detail="CVE not found")
    
    priority = calculate_priority_score(cve.cvss_score, cve.is_cisa_kev, cve.epss_score)
    return {
        "cve_id": cve.cve_id,
        "cvss_score": cve.cvss_score,
        "is_cisa_kev": cve.is_cisa_kev,
        "epss_score": cve.epss_score,
        "priority_score": priority,
        "description": cve.description,
        "affected_cpe": cve.affected_cpe,
        "patch_guidance": cve.patch_guidance,
        "published_date": cve.published_date.isoformat() if cve.published_date else None
    }

@router.post("/sync")
async def trigger_cve_sync(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    synced = await sync_vulnerability_database(db)
    await log_audit(db, current_user.username, current_user.role, "CVE_SYNC", "CVE", {"synced": synced})
    return {"status": "success", "message": f"Synchronized {synced} CVE definitions"}

@router.post("/import-json")
async def import_custom_cve_json(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))
        if not isinstance(data, list):
            data = [data]
        synced = await sync_vulnerability_database(db, custom_data_list=data)
        await log_audit(db, current_user.username, current_user.role, "CVE_JSON_IMPORT", "CVE", {"filename": file.filename, "imported": synced})
        return {"status": "success", "imported": synced}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")

