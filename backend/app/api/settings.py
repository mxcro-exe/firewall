from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.audit import log_audit
from app.core.config import settings
from app.models.user import User
from app.schemas.settings import GeneralSettings, NotificationSettings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/")
async def get_settings(current_user: User = Depends(get_current_user)):
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "default_security_mode": settings.DEFAULT_SECURITY_MODE,
        "auto_rollback_threshold": settings.AUTO_ROLLBACK_FP_THRESHOLD,
        "telegram_configured": bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID),
        "smtp_configured": bool(settings.SMTP_HOST and settings.SMTP_USER),
        "offline_mode": True
    }

@router.put("/general")
async def update_general_settings(
    req: GeneralSettings,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    settings.DEFAULT_SECURITY_MODE = req.default_security_mode
    settings.AUTO_ROLLBACK_FP_THRESHOLD = req.auto_rollback_threshold
    await log_audit(db, current_user.username, current_user.role, "GENERAL_SETTINGS_UPDATED", "System", req.dict())
    return {"status": "success", "message": "General settings updated"}

@router.put("/notifications")
async def update_notifications(
    req: NotificationSettings,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    if req.telegram_bot_token is not None:
        settings.TELEGRAM_BOT_TOKEN = req.telegram_bot_token
    if req.telegram_chat_id is not None:
        settings.TELEGRAM_CHAT_ID = req.telegram_chat_id
    if req.smtp_host is not None:
        settings.SMTP_HOST = req.smtp_host
    if req.smtp_port is not None:
        settings.SMTP_PORT = req.smtp_port
    if req.smtp_user is not None:
        settings.SMTP_USER = req.smtp_user
    if req.smtp_password is not None:
        settings.SMTP_PASSWORD = req.smtp_password
    if req.smtp_from_email is not None:
        settings.SMTP_FROM_EMAIL = req.smtp_from_email
    if req.webhook_url is not None:
        settings.WEBHOOK_URL = req.webhook_url

    await log_audit(db, current_user.username, current_user.role, "NOTIFICATION_SETTINGS_UPDATED", "System")
    return {"status": "success", "message": "Notification channels updated"}
