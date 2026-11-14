import json
from datetime import datetime
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog

async def log_audit(
    db: AsyncSession,
    actor: str,
    role: str,
    action: str,
    target_entity: str,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
):
    details_str = json.dumps(details) if isinstance(details, (dict, list)) else (str(details) if details else None)
    entry = AuditLog(
        actor=actor,
        role=role,
        action=action,
        target_entity=target_entity,
        details=details_str,
        ip_address=ip_address,
        timestamp=datetime.utcnow()
    )
    db.add(entry)
    await db.commit()

