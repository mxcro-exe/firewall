from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    is_first_run_completed: bool

class LoginRequest(BaseModel):
    username: str
    password: str
    totp_code: Optional[str] = None

class SetupWizardRequest(BaseModel):
    site_name: str
    domain_or_host: str
    upstream_url: str
    security_mode: str = "PROTECT"
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class LanguageUpdateRequest(BaseModel):
    language: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: Optional[str] = None
    role: str
    totp_enabled: bool
    preferred_language: str = "en"
    is_active: bool
    is_first_run_completed: bool
    created_at: datetime
