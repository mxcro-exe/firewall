import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.site import Site
from app.models.rule import VirtualPatchRule
from app.models.traffic import TrafficLog
from app.models.user import User
from app.reporting.pdf_generator import generate_executive_security_pdf

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/pdf")
async def download_security_pdf(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch demo site details
    site_res = await db.execute(select(Site).limit(1))
    site = site_res.scalars().first()
    site_name = site.name if site else "My Store"

    # Count active rules
    rules_res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.status.in_(["SHADOW", "CANARY", "ENFORCED"])))
    active_count = len(rules_res.scalars().all())

    # Count blocked
    blocked_res = await db.execute(select(TrafficLog).where(TrafficLog.rule_action.in_(["ENFORCE_BLOCKED", "CANARY_BLOCKED", "MODULE_BLOCKED"])))
    blocked_count = len(blocked_res.scalars().all())

    kpis = {
        "mean_time_to_virtual_patch": "2.4 minutes",
        "exposure_window_reduction": "96.8%",
        "false_block_rate": "0.00%"
    }

    pdf_bytes = generate_executive_security_pdf(
        site_name=site_name,
        health_score=88,
        active_patches_count=active_count,
        blocked_count=blocked_count,
        kpis=kpis
    )

    filename = f"PatchShield_Security_Report_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/csv/incidents")
async def download_incidents_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(TrafficLog).where(TrafficLog.rule_action.in_(["ENFORCE_BLOCKED", "CANARY_BLOCKED", "MODULE_BLOCKED"])).order_by(TrafficLog.timestamp.desc())
    )
    logs = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Client IP", "Method", "Path", "Query / Payload", "Action", "Status"])

    for l in logs:
        writer.writerow([
            l.id, l.timestamp.isoformat(), l.client_ip, l.method, l.path,
            l.query_params_sanitized or (l.body_sanitized or ""), l.rule_action, l.response_status
        ])

    filename = f"PatchShield_Incidents_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
