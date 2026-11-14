from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.rule import VirtualPatchRule
from app.models.proof import ProofRun
from app.models.user import User
from app.pipeline.stepper import run_prove_then_patch_lifecycle, rollback_rule

router = APIRouter(prefix="/prove-patch", tags=["Prove-then-Patch Pipeline"])

class RunPipelineRequest(BaseModel):
    advance_to_stage: Optional[str] = "ENFORCED"  # DRAFT, SHADOW, CANARY, ENFORCED

class RollbackRequest(BaseModel):
    reason: Optional[str] = "Manual operator rollback"

@router.post("/{rule_id}/run")
async def trigger_prove_then_patch(
    rule_id: str,
    req: RunPipelineRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    result = await run_prove_then_patch_lifecycle(rule_id, db, advance_to_stage=req.advance_to_stage)
    await log_audit(db, current_user.username, current_user.role, "PROVE_PATCH_PIPELINE_RUN", "VirtualPatchRule", {
        "rule_id": rule_id, "advance_to": req.advance_to_stage, "status": result.get("status")
    })
    return result

@router.post("/{rule_id}/rollback")
async def rollback_virtual_patch(
    rule_id: str,
    req: RollbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    result = await rollback_rule(rule_id, db, reason=req.reason)
    await log_audit(db, current_user.username, current_user.role, "RULE_ROLLBACK", "VirtualPatchRule", {
        "rule_id": rule_id, "reason": req.reason
    })
    return result

@router.get("/{rule_id}/evidence")
async def get_proof_evidence(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(ProofRun).where(ProofRun.rule_id == rule_id).order_by(ProofRun.completed_at.desc())
    )
    return res.scalars().all()

