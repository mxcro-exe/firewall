from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, Text, DateTime
from app.core.database import Base

class CVE(Base):
    __tablename__ = "cves"

    cve_id = Column(String(50), primary_key=True, index=True)
    cvss_score = Column(Float, default=0.0)
    is_cisa_kev = Column(Boolean, default=False, index=True)
    epss_score = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    affected_cpe = Column(Text, nullable=True)
    patch_guidance = Column(Text, nullable=True)
    published_date = Column(DateTime, nullable=True)
    cached_at = Column(DateTime, default=datetime.utcnow)
