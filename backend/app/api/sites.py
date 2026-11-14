from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse, SiteModeToggle

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.get("/", response_model=List[SiteResponse])
async def list_sites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Site).order_by(Site.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    req: SiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    # Normalize domain / host
    new_site = Site(
        name=req.name,
        domain_or_host=req.domain_or_host.strip().lower(),
        upstream_url=req.upstream_url.rstrip("/"),
        listen_port=req.listen_port,
        security_mode=req.security_mode,
        health_score=85
    )
    db.add(new_site)
    await db.commit()
    await db.refresh(new_site)
    await log_audit(db, current_user.username, current_user.role, "SITE_CREATED", "Site", {"site_id": new_site.id, "name": new_site.name})
    return new_site

@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: str,
    req: SiteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    update_data = req.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(site, field, val)

    await db.commit()
    await db.refresh(site)
    await log_audit(db, current_user.username, current_user.role, "SITE_UPDATED", "Site", {"site_id": site.id, "updates": update_data})
    return site

@router.patch("/{site_id}/mode", response_model=SiteResponse)
async def toggle_site_mode(
    site_id: str,
    req: SiteModeToggle,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    valid_modes = ["MONITOR", "PROTECT", "STRICT"]
    if req.security_mode.upper() not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Must be one of {valid_modes}")

    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    old_mode = site.security_mode
    site.security_mode = req.security_mode.upper()
    await db.commit()
    await db.refresh(site)
    await log_audit(db, current_user.username, current_user.role, "SECURITY_MODE_CHANGED", "Site", {
        "site_id": site.id,
        "old_mode": old_mode,
        "new_mode": site.security_mode
    })
    return site

@router.delete("/{site_id}")
async def delete_site(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    await db.delete(site)
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "SITE_DELETED", "Site", {"site_id": site_id, "name": site.name})
    return {"status": "success", "message": f"Site {site.name} removed successfully"}

@router.post("/{site_id}/check-bypass")
async def check_site_bypass(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    # WAF Bypass check: attempt connection to upstream directly
    bypass_found = False
    details = ""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(site.upstream_url)
            # If reachable without gateway headers, warn
            bypass_found = True
            details = f"Upstream directly reachable on {site.upstream_url} (HTTP {resp.status_code}). Ensure firewall restricts access to Gateway IP only."
    except Exception as e:
        bypass_found = False
        details = f"Direct access restricted or upstream offline ({str(e)})"

    site.bypass_detected = bypass_found
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "BYPASS_CHECK_EXECUTED", "Site", {
        "site_id": site.id, "bypass_detected": bypass_found
    })
    return {
        "site_id": site.id,
        "bypass_detected": bypass_found,
        "recommendation": details
    }

