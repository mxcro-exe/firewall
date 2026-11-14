from typing import Optional
from pydantic import BaseModel

class GeneralSettings(BaseModel):
    project_name: str
    default_security_mode: str
    auto_rollback_threshold: float
    offline_mode: bool = True

class NotificationSettings(BaseModel):
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    webhook_url: Optional[str] = None

class TotpSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str

class TotpVerifyRequest(BaseModel):
    code: str
