import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from app.core.database import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    domain_or_host = Column(String(255), index=True, nullable=False)
    upstream_url = Column(String(255), nullable=False)  # e.g. http://127.0.0.1:9000
    listen_port = Column(Integer, default=8000, nullable=False)
    security_mode = Column(String(20), default="PROTECT", nullable=False)  # MONITOR, PROTECT, STRICT
    health_score = Column(Integer, default=85)
    bypass_detected = Column(Boolean, default=False)
    preferred_language = Column(String(10), default="en", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

