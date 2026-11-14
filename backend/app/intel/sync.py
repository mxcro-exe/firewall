import json
from pathlib import Path
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.models.cve import CVE
from app.intel.cve_data import CURATED_SMB_CVES, ensure_offline_cache_files

def calculate_priority_score(cvss: float, is_kev: bool, epss: float) -> float:
    """
    Composite Priority Formula:
    CVSS (0-10, weight 40%) + CISA KEV (bonus 3.0 points) + EPSS (0-1, weight 30%)
    Max score ~ 10.0
    """
    score = (cvss * 0.4) + (3.0 if is_kev else 0.0) + (epss * 3.0)
    return round(min(score, 10.0), 2)

async def sync_vulnerability_database(db: AsyncSession, custom_data_list=None):
    """Sync CVEs into SQLite from offline JSON cache or uploaded dataset"""
    ensure_offline_cache_files(Path(settings.NVD_CACHE_PATH).parent)
    
    data_to_load = custom_data_list
    if not data_to_load:
        cache_path = Path(settings.NVD_CACHE_PATH)
        if cache_path.exists():
            with open(cache_path, "r", encoding="utf-8") as f:
                data_to_load = json.load(f)
        else:
            data_to_load = CURATED_SMB_CVES

    synced_count = 0
    for item in data_to_load:
        cve_id = item.get("cve_id")
        if not cve_id:
            continue
            
        res = await db.execute(select(CVE).where(CVE.cve_id == cve_id))
        existing = res.scalars().first()

        cvss = float(item.get("cvss_score", 0.0))
        is_kev = bool(item.get("is_cisa_kev", False))
        epss = float(item.get("epss_score", 0.0))

        pub_date = None
        if item.get("published_date"):
            try:
                pub_date = datetime.fromisoformat(item["published_date"].replace("Z", ""))
            except Exception:
                pub_date = datetime.utcnow()

        if existing:
            existing.cvss_score = cvss
            existing.is_cisa_kev = is_kev
            existing.epss_score = epss
            existing.description = item.get("description", existing.description)
            existing.affected_cpe = item.get("affected_cpe", existing.affected_cpe)
            existing.patch_guidance = item.get("patch_guidance", existing.patch_guidance)
            existing.cached_at = datetime.utcnow()
        else:
            new_cve = CVE(
                cve_id=cve_id,
                cvss_score=cvss,
                is_cisa_kev=is_kev,
                epss_score=epss,
                description=item.get("description", ""),
                affected_cpe=item.get("affected_cpe", ""),
                patch_guidance=item.get("patch_guidance", ""),
                published_date=pub_date,
                cached_at=datetime.utcnow()
            )
            db.add(new_cve)
            synced_count += 1

    await db.commit()
    return synced_count

