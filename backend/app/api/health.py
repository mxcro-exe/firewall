from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.site import Site
from app.intel.matching import match_cve_exposure_for_site
from app.models.user import User

router = APIRouter(prefix="/health", tags=["Security Health Score"])

@router.get("/{site_id}")
async def get_site_health_score(
    site_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Site).where(Site.id == site_id))
    site = res.scalars().first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    score = 100
    top_fixes = []

    # Check 1: Bypass exposure
    if site.bypass_detected:
        score -= 20
        top_fixes.append({
            "issue_en": "Direct Origin IP Exposed",
            "issue_ta": "பின்தள சேவையகம் நேரடியாக இணையத்தில் திறந்துள்ளது",
            "fix_en": "Configure firewall to only allow incoming traffic from PatchShield Gateway IP.",
            "fix_ta": "PatchShield வாயிலில் இருந்து மட்டுமே போக்குவரத்தை அனுமதிக்க ஃபயர்வால் அமைப்பை மாற்றவும்.",
            "impact_points": "+20 pts"
        })

    # Check 2: Unpatched CVEs
    exposure_list = await match_cve_exposure_for_site(site_id, db)
    affected = [e for e in exposure_list if e["status"] == "AFFECTED"]
    if len(affected) > 0:
        penalty = min(len(affected) * 10, 30)
        score -= penalty
        top_fixes.append({
            "issue_en": f"{len(affected)} High-Risk Disclosed CVEs Unpatched",
            "issue_ta": f"{len(affected)} ஆபத்தான இணைய பாதிப்புகள் கண்டறியப்பட்டுள்ளன",
            "fix_en": "Activate 1-click virtual patches via Prove-then-Patch pipeline.",
            "fix_ta": "நிரூபித்து இணை (Prove-then-Patch) மூலம் ஒரே கிளிக்கில் மெய்நிகர் விதியை செயல்படுத்தவும்.",
            "impact_points": f"+{penalty} pts"
        })

    # Check 3: Strict mode recommendation
    if site.security_mode == "MONITOR":
        score -= 15
        top_fixes.append({
            "issue_en": "Gateway is in Monitor-Only Mode",
            "issue_ta": "நுழைவாயில் கண்காணிப்பு முறையில் மட்டுமே உள்ளது",
            "fix_en": "Promote security mode to 'Protect' to actively block attacks.",
            "fix_ta": "தாக்குதல்களை நேரடியாக தடுக்க 'Protect' முறைக்கு மாற்றவும்.",
            "impact_points": "+15 pts"
        })
    elif site.security_mode == "PROTECT" and len(top_fixes) < 3:
        top_fixes.append({
            "issue_en": "Add Automated Backup Schedule",
            "issue_ta": "தானியங்கி காப்புப்பிரதி அட்டவணையைச் சேர்க்கவும்",
            "fix_en": "Ensure nightly database and configuration snapshots are saved.",
            "fix_ta": "ஒவ்வொரு இரவும் தரவுத்தள காப்புப்பிரதி சேமிக்கப்படுவதை உறுதிசெய்யவும்.",
            "impact_points": "+5 pts"
        })

    final_score = max(score, 0)
    grade = "A" if final_score >= 80 else ("B" if final_score >= 60 else "C")

    return {
        "site_id": site.id,
        "site_name": site.name,
        "health_score": final_score,
        "grade": grade,
        "top_fixes": top_fixes[:3]
    }
