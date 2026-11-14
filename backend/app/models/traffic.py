from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from app.core.database import Base

class TrafficLog(Base):
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    site_id = Column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    client_ip = Column(String(45), nullable=False, index=True)
    method = Column(String(10), nullable=False)
    path = Column(String(255), nullable=False, index=True)
    query_params_sanitized = Column(Text, nullable=True)
    body_sanitized = Column(Text, nullable=True)
    headers_sanitized = Column(Text, nullable=True)
    ml_score = Column(Float, default=0.0)
    ml_prediction = Column(String(50), default="Benign")
    # Action: PASSED, SHADOW_LOGGED, CANARY_BLOCKED, ENFORCE_BLOCKED, MODULE_BLOCKED
    rule_action = Column(String(30), default="PASSED", index=True)
    matched_rule_id = Column(String(36), nullable=True)
    response_status = Column(Integer, default=200)

