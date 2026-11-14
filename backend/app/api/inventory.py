from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.site import Site
from app.models.inventory import StackInventory
from app.models.user import User
from app.intel.inventory import fingerprint_upstream_headers, parse_manifest_content
from app.intel.matching import match_cve_exposure_for_site

router = APIRouter(prefix="/inventory", tags=["Stack Inventory & Exposure"])

class ManualComponentCreate(BaseModel):
    component_name: str
    version: str
    cpe_string: Optional[str] = None

@router.get("/{site_id}")
async def list_site_inventory(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(StackInventory).where(StackInventory.site_id == site_id))
    return res.scalars().all()

@router.post("/{site_id}/manual")
async def add_manual_component(
    site_id: str,
    req: ManualComponentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    # Verify site
    site_res = await db.execute(select(Site).where(Site.id == site_id))
    if not site_res.scalars().first():
        raise HTTPException(status_code=404, detail="Site not found")

    item = StackInventory(
        site_id=site_id,
        component_name=req.component_name.strip().lower(),
        version=req.version.strip(),
        cpe_string=req.cpe_string or f"cpe:2.3:a:custom:{req.component_name.lower()}:{req.version}:*:*:*:*:*:*:*",
        detection_source="MANUAL"
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    await log_audit(db, current_user.username, current_user.role, "INVENTORY_COMPONENT_ADDED", "StackInventory", {"site_id": site_id, "component": req.component_name})
    return item

@router.delete("/{site_id}/{item_id}")
async def delete_component(
    site_id: str,
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    res = await db.execute(select(StackInventory).where(StackInventory.id == item_id, StackInventory.site_id == site_id))
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Component not found")
    await db.delete(item)
    await db.commit()
    return {"status": "success", "message": "Component removed"}

@router.post("/{site_id}/scan-headers")
async def scan_upstream_headers(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    site_res = await db.execute(select(Site).where(Site.id == site_id))
    site = site_res.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    detected = await fingerprint_upstream_headers(site.upstream_url, site_id, db)
    await log_audit(db, current_user.username, current_user.role, "FINGERPRINT_HEADERS_SCAN", "Site", {"site_id": site_id, "detected": len(detected)})
    return {
        "status": "success",
        "detected_count": len(detected),
        "components": detected
    }

@router.post("/{site_id}/upload-manifest")
async def upload_dependency_manifest(
    site_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    site_res = await db.execute(select(Site).where(Site.id == site_id))
    if not site_res.scalars().first():
        raise HTTPException(status_code=404, detail="Site not found")

    content = (await file.read()).decode("utf-8", errors="ignore")
    parsed = parse_manifest_content(file.filename, content)

    added_count = 0
    for comp in parsed:
        res = await db.execute(select(StackInventory).where(
            StackInventory.site_id == site_id,
            StackInventory.component_name == comp["name"]
        ))
        existing = res.scalars().first()
        if existing:
            existing.version = comp["version"]
            existing.cpe_string = comp["cpe"]
            existing.detection_source = "MANIFEST"
        else:
            item = StackInventory(
                site_id=site_id,
                component_name=comp["name"],
                version=comp["version"],
                cpe_string=comp["cpe"],
                detection_source="MANIFEST"
            )
            db.add(item)
        added_count += 1

    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "DEPENDENCY_MANIFEST_UPLOAD", "StackInventory", {"site_id": site_id, "file": file.filename, "packages": added_count})
    return {
        "status": "success",
        "message": f"Processed {file.filename}",
        "packages_imported": added_count
    }

@router.get("/{site_id}/exposure")
async def get_site_exposure_matching(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    site_res = await db.execute(select(Site).where(Site.id == site_id))
    if not site_res.scalars().first():
        raise HTTPException(status_code=404, detail="Site not found")

    matches = await match_cve_exposure_for_site(site_id, db)
    return matches

