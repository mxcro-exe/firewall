import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    phase = Column(String(20), nullable=False)  # OBSERVE, DECIDE, ACT, REPORT
    observation = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    proposed_action = Column(String(255), nullable=False)
    # EXECUTED, PENDING_APPROVAL, REJECTED, ROLLED_BACK
    status = Column(String(30), default="EXECUTED")
    approved_by = Column(String(50), nullable=True)
    explanation_en = Column(Text, nullable=False)
    explanation_ta = Column(Text, nullable=False)
