import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from app.core.database import Base

class VirtualPatchRule(Base):
    __tablename__ = "virtual_patch_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cve_id = Column(String(50), ForeignKey("cves.cve_id"), nullable=True, index=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    http_method = Column(String(10), default="ANY")  # GET, POST, ANY, etc.
    endpoint_path = Column(String(255), nullable=False)  # e.g. /api/products
    target_param = Column(String(100), nullable=True)  # query/body param or None for full payload
    pattern_type = Column(String(20), default="REGEX")  # REGEX, AST, TOKEN, HEADER
    pattern_value = Column(Text, nullable=False)
    # Lifecycle: DRAFT -> SANDBOX_OK -> SHADOW -> CANARY -> ENFORCED -> RETIRED
    status = Column(String(20), default="DRAFT", index=True)
    version = Column(Integer, default=1)
    explanation_en = Column(Text, nullable=True)
    explanation_ta = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
