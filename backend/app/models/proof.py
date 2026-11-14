import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey
from app.core.database import Base

class ProofRun(Base):
    __tablename__ = "proof_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String(36), ForeignKey("virtual_patch_rules.id", ondelete="CASCADE"), nullable=False, index=True)
    # STAGE_1_EXPLOIT, STAGE_2_REPLAY, STAGE_3_SHADOW, STAGE_4_CANARY, STAGE_5_ENFORCE
    stage = Column(String(30), nullable=False)
    status = Column(String(20), default="RUNNING")  # PASS, FAIL, RUNNING
    exploit_evidence = Column(Text, nullable=True)  # Payload sent, response code, block verification
    replay_fp_rate = Column(Float, default=0.0)      # % legitimate requests blocked (must be 0.0)
    shadow_matches = Column(Integer, default=0)     # Count of would-be blocks in shadow
    canary_pct = Column(Integer, default=0)          # Current canary traffic %
    run_log = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
