from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.rule import VirtualPatchRule
from app.models.site import Site
from app.models.user import User
from app.rules.templates import RULE_TEMPLATES

router = APIRouter(prefix="/rules", tags=["Virtual Patch Rules"])

class RuleCreate(BaseModel):
    site_id: str
    cve_id: Optional[str] = None
    name: str
    http_method: str = "ANY"
    endpoint_path: str
    target_param: Optional[str] = None
    pattern_type: str = "REGEX"
    pattern_value: str
    explanation_en: Optional[str] = None
    explanation_ta: Optional[str] = None

class RuleUpdate(BaseModel):
    name: Optional[str] = None
    http_method: Optional[str] = None
    endpoint_path: Optional[str] = None
    target_param: Optional[str] = None
    pattern_value: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    explanation_en: Optional[str] = None
    explanation_ta: Optional[str] = None

@router.get("/templates")
async def get_rule_templates():
    return RULE_TEMPLATES

@router.get("/")
async def list_rules(
    site_id: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(VirtualPatchRule).order_by(VirtualPatchRule.created_at.desc())
    if site_id:
        query = query.where(VirtualPatchRule.site_id == site_id)
    if status:
        query = query.where(VirtualPatchRule.status == status)
    res = await db.execute(query)
    return res.scalars().all()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_rule(
    req: RuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    site_res = await db.execute(select(Site).where(Site.id == req.site_id))
    if not site_res.scalars().first():
        raise HTTPException(status_code=404, detail="Site not found")

    new_rule = VirtualPatchRule(
        site_id=req.site_id,
        cve_id=req.cve_id,
        name=req.name,
        http_method=req.http_method.upper(),
        endpoint_path=req.endpoint_path.strip(),
        target_param=req.target_param.strip() if req.target_param else None,
        pattern_type=req.pattern_type.upper(),
        pattern_value=req.pattern_value,
        status="DRAFT",
        version=1,
        explanation_en=req.explanation_en or "Blocks malicious exploit payload matching specified pattern.",
        explanation_ta=req.explanation_ta or "குறிப்பிட்ட மாதிரிக்கு பொருந்தும் தீங்கிழைக்கும் தாக்குதல் தரவைத் தடுக்கிறது.",
        is_active=True
    )
    db.add(new_rule)
    await db.commit()
    await db.refresh(new_rule)

    await log_audit(db, current_user.username, current_user.role, "RULE_CREATED", "VirtualPatchRule", {
        "rule_id": new_rule.id, "name": new_rule.name, "endpoint": new_rule.endpoint_path
    })
    return new_rule

@router.get("/{rule_id}")
async def get_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule

@router.put("/{rule_id}")
async def update_rule(
    rule_id: str,
    req: RuleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    data = req.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(rule, k, v)
    rule.version += 1

    await db.commit()
    await db.refresh(rule)
    await log_audit(db, current_user.username, current_user.role, "RULE_UPDATED", "VirtualPatchRule", {
        "rule_id": rule.id, "new_version": rule.version
    })
    return rule

@router.patch("/{rule_id}/toggle")
async def toggle_rule_active(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    rule.is_active = not rule.is_active
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "RULE_TOGGLED", "VirtualPatchRule", {
        "rule_id": rule.id, "is_active": rule.is_active
    })
    return {"rule_id": rule.id, "is_active": rule.is_active}

@router.delete("/{rule_id}")
async def delete_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    await db.delete(rule)
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "RULE_DELETED", "VirtualPatchRule", {"rule_id": rule_id})
    return {"status": "success", "message": "Rule deleted"}
