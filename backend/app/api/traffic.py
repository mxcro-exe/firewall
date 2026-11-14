from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.traffic import TrafficLog
from app.models.user import User

router = APIRouter(prefix="/traffic", tags=["Traffic Stream & Replay"])

@router.get("/")
async def list_traffic_logs(
    site_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(TrafficLog).order_by(TrafficLog.timestamp.desc())
    if site_id:
        query = query.where(TrafficLog.site_id == site_id)
    if action:
        query = query.where(TrafficLog.rule_action == action)
    query = query.limit(limit).offset(offset)

    res = await db.execute(query)
    logs = res.scalars().all()
    return logs

