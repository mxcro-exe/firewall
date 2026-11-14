import re
from typing import List, Dict, Any
from packaging import version as pkg_version
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.cve import CVE
from app.models.inventory import StackInventory
from app.intel.sync import calculate_priority_score

def compare_versions(installed_ver: str, vuln_condition: str) -> str:
    """Compare installed version against condition string (e.g. '<= 2.4.0' or '< 5.18.3')"""
    if not installed_ver or installed_ver.lower() == "unknown":
        return "UNSURE"

    clean_inst = re.sub(r'[^0-9\.]', '', installed_ver).strip(".")
    if not clean_inst:
        return "UNSURE"

    try:
        parsed_inst = pkg_version.parse(clean_inst)

        # Check conditions
        if "<=" in vuln_condition:
            thresh = vuln_condition.replace("<=", "").strip()
            return "AFFECTED" if parsed_inst <= pkg_version.parse(thresh) else "NOT_AFFECTED"
        elif "<" in vuln_condition:
            thresh = vuln_condition.replace("<", "").strip()
            return "AFFECTED" if parsed_inst < pkg_version.parse(thresh) else "NOT_AFFECTED"
        elif "==" in vuln_condition or "," in vuln_condition:
            targets = [t.strip() for t in vuln_condition.split(",")]
            return "AFFECTED" if clean_inst in targets else "NOT_AFFECTED"
        else:
            return "AFFECTED"
    except Exception:
        return "UNSURE"


async def match_cve_exposure_for_site(site_id: str, db: AsyncSession) -> List[Dict[str, Any]]:
    """Match all CVEs against the site's recorded stack inventory"""
    # 1. Fetch site inventory
    inv_res = await db.execute(select(StackInventory).where(StackInventory.site_id == site_id))
    inventory_items = inv_res.scalars().all()
    inventory_map = {item.component_name.lower(): item.version for item in inventory_items}

    # 2. Fetch all CVEs
    cve_res = await db.execute(select(CVE).order_by(CVE.cvss_score.desc()))
    cves = cve_res.scalars().all()

    matched_results = []

    for cve in cves:
        priority = calculate_priority_score(cve.cvss_score, cve.is_cisa_kev, cve.epss_score)
        
        # Check matching component
        matched_status = "NOT_AFFECTED"
        match_reason = "No matching component found in site stack inventory."
        matched_component = None
        matched_version = None

        # Extract product keywords from description or affected_cpe
        cpe_str = (cve.affected_cpe or "").lower()
        desc_str = (cve.description or "").lower()

        for comp_name, comp_ver in inventory_map.items():
            if comp_name in cpe_str or comp_name in desc_str:
                matched_component = comp_name
                matched_version = comp_ver

                # Determine condition
                if "storefront" in comp_name:
                    status = compare_versions(comp_ver, "<= 2.4.0")
                elif "file_preview" in comp_name:
                    status = compare_versions(comp_ver, "<= 1.2.0")
                elif "wp-automatic" in comp_name:
                    status = compare_versions(comp_ver, "< 3.92.1")
                elif "minio" in comp_name:
                    status = "AFFECTED" if comp_ver.startswith("2023") else "UNSURE"
                else:
                    status = "UNSURE" if comp_ver.lower() == "unknown" else "AFFECTED"

                matched_status = status
                if status == "AFFECTED":
                    match_reason = f"Component '{comp_name}' version '{comp_ver}' is directly vulnerable to {cve.cve_id}."
                elif status == "UNSURE":
                    match_reason = f"Component '{comp_name}' detected, but exact version could not be confirmed."
                else:
                    match_reason = f"Component '{comp_name}' running patched/safe version '{comp_ver}'."
                break

        matched_results.append({
            "cve_id": cve.cve_id,
            "cvss_score": cve.cvss_score,
            "is_cisa_kev": cve.is_cisa_kev,
            "epss_score": cve.epss_score,
            "priority_score": priority,
            "description": cve.description,
            "affected_cpe": cve.affected_cpe,
            "patch_guidance": cve.patch_guidance,
            "published_date": cve.published_date.isoformat() if cve.published_date else None,
            "status": matched_status,  # AFFECTED | NOT_AFFECTED | UNSURE
            "reason": match_reason,
            "matched_component": matched_component,
            "matched_version": matched_version
        })

    # Sort: AFFECTED first, then by priority_score descending
    status_order = {"AFFECTED": 0, "UNSURE": 1, "NOT_AFFECTED": 2}
    matched_results.sort(key=lambda x: (status_order.get(x["status"], 3), -x["priority_score"]))

    return matched_results

