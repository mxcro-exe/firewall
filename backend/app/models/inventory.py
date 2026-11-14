from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base

class StackInventory(Base):
    __tablename__ = "stack_inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    component_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    cpe_string = Column(String(255), nullable=True)
    detection_source = Column(String(20), default="MANUAL")  # MANUAL, HEADER, MANIFEST
    detected_at = Column(DateTime, default=datetime.utcnow)

