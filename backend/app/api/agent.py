from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.models.agent_log import AgentAction
from app.models.user import User
from app.agent.loop import patchshield_agent

router = APIRouter(prefix="/agent", tags=["Agentic AI Layer"])

@router.get("/timeline")
async def get_agent_timeline(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(AgentAction).order_by(AgentAction.timestamp.desc()).limit(limit))
    return res.scalars().all()

@router.post("/run-cycle/{site_id}")
async def trigger_agent_ooda_cycle(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    result = await patchshield_agent.run_ooda_cycle(site_id, db)
    await log_audit(db, current_user.username, current_user.role, "AGENT_OODA_CYCLE", "Agent", {
        "site_id": site_id, "actions": result.get("actions_executed")
    })
    return result

@router.post("/approve/{action_id}")
async def approve_agent_action(
    action_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    res = await db.execute(select(AgentAction).where(AgentAction.id == action_id))
    action = res.scalars().first()
    if not action:
        raise HTTPException(status_code=404, detail="Agent action not found")

    action.status = "APPROVED_BY_OWNER"
    action.approved_by = current_user.username
    await db.commit()
    await log_audit(db, current_user.username, current_user.role, "AGENT_ACTION_APPROVED", "AgentAction", {
        "action_id": action_id
    })
    return {"status": "success", "message": "Action approved by owner"}

