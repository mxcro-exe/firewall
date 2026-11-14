from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime
from app.core.database import Base

class AttackModuleSetting(Base):
    __tablename__ = "attack_module_settings"

    # ddos, sqli, xss, path, cmd, brute, bot
    module_key = Column(String(30), primary_key=True)
    module_name = Column(String(100), nullable=False)
    is_enabled = Column(Boolean, default=True)
    sensitivity = Column(String(10), default="MEDIUM")  # LOW, MEDIUM, HIGH
    custom_config_json = Column(Text, default="{}")
    blocked_count_24h = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
