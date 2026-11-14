from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SiteBase(BaseModel):
    name: str
    domain_or_host: str
    upstream_url: str
    listen_port: int = 8000
    security_mode: str = "PROTECT"
    preferred_language: str = "en"

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    domain_or_host: Optional[str] = None
    upstream_url: Optional[str] = None
    listen_port: Optional[int] = None
    security_mode: Optional[str] = None
    preferred_language: Optional[str] = None
    is_active: Optional[bool] = None

class SiteModeToggle(BaseModel):
    security_mode: str  # MONITOR | PROTECT | STRICT

class SiteResponse(SiteBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    health_score: int
    bypass_detected: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
