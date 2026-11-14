from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alert import Alert
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["Bilingual Alerts"])

@router.get("/")
async def list_alerts(
    site_id: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Alert).order_by(Alert.created_at.desc())
    if site_id:
        query = query.where(Alert.site_id == site_id)
    if unread_only:
        query = query.where(Alert.is_read == False)
    query = query.limit(limit)

    res = await db.execute(query)
    return res.scalars().all()

@router.patch("/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    return {"status": "success", "alert_id": alert_id, "is_read": True}

