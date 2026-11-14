import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=True, index=True)
    severity = Column(String(20), default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    title_en = Column(String(255), nullable=False)
    title_ta = Column(String(255), nullable=False)
    message_en = Column(Text, nullable=False)
    message_ta = Column(Text, nullable=False)
    channel = Column(String(30), default="IN_APP")  # TELEGRAM, EMAIL, WEBHOOK, IN_APP
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
