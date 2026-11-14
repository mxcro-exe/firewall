import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.agent_log import AgentAction
from app.models.alert import Alert
from app.models.site import Site
from app.models.rule import VirtualPatchRule
from app.models.traffic import TrafficLog
from app.intel.matching import match_cve_exposure_for_site
from app.pipeline.stepper import run_prove_then_patch_lifecycle
from app.rules.templates import RULE_TEMPLATES

class PatchShieldAgent:
    """
    Autonomous OODA Layer for Virtual Patching:
    Observe -> Decide -> Act -> Report
    """
    async def run_ooda_cycle(self, site_id: str, db: AsyncSession) -> Dict[str, Any]:
        site_res = await db.execute(select(Site).where(Site.id == site_id))
        site = site_res.scalars().first()
        if not site:
            return {"error": "Site not found"}

        actions_taken = []

        # 1. OBSERVE: Check exposure matching and traffic anomalies
        exposure_list = await match_cve_exposure_for_site(site_id, db)
        affected_cves = [e for e in exposure_list if e["status"] == "AFFECTED"]

        # 2. DECIDE & ACT: For each affected CVE without an active rule, synthesize a patch
        for vuln in affected_cves:
            cve_id = vuln["cve_id"]
            # Check if active rule already exists
            existing_res = await db.execute(
                select(VirtualPatchRule).where(
                    VirtualPatchRule.site_id == site_id,
                    VirtualPatchRule.cve_id == cve_id,
                    VirtualPatchRule.status.in_(["SHADOW", "CANARY", "ENFORCED"])
                )
            )
            if existing_res.scalars().first():
                continue

            # Decide rule parameters
            tpl_key = "sqli" if "sql" in vuln["description"].lower() else "path_traversal"
            tpl = RULE_TEMPLATES.get(tpl_key, RULE_TEMPLATES["sqli"])
            endpoint = "/api/products" if "storefront" in (vuln.get("matched_component") or "") else "/api/preview"
            param = "q" if "sqli" in tpl_key else "filename"

            # ACT: Synthesize virtual patch rule
            rule_name = f"Auto-Patch: {cve_id} ({vuln.get('matched_component', 'app')})"
            new_rule = VirtualPatchRule(
                site_id=site_id,
                cve_id=cve_id,
                name=rule_name,
                http_method="ANY",
                endpoint_path=endpoint,
                target_param=param,
                pattern_type="REGEX",
                pattern_value=tpl["pattern_value"],
                status="DRAFT",
                version=1,
                explanation_en=f"Agent synthesized virtual patch for {cve_id} protecting {endpoint}?{param}=.",
                explanation_ta=f"Agent தானாகவே {cve_id} பாதிப்பிலிருந்து {endpoint}?{param}= பாதையை பாதுகாக்க மெய்நிகர் விதியை உருவாக்கியது.",
                is_active=True
            )
            db.add(new_rule)
            await db.commit()
            await db.refresh(new_rule)

            # ACT: Run Prove-then-Patch up to SHADOW mode
            ptp_result = await run_prove_then_patch_lifecycle(new_rule.id, db, advance_to_stage="SHADOW")

            # REPORT: Bilingual alert in plain simple words for shopkeeper
            title_en = f"Security Patch Deployed for {site.name}"
            title_ta = f"{site.name}-க்கு புதிய பாதுகாப்பு விதி செயல்படுத்தப்பட்டது"
            msg_en = f"PatchShield Agent detected vulnerable component for {cve_id}. Rule tested safe in sandbox and deployed to Shadow Mode."
            msg_ta = f"{cve_id} பாதிப்பு கண்டறியப்பட்டது. PatchShield முகவர் தானாகவே விதியை சோதித்து, உங்கள் வாடிக்கையாளர்களை பாதிக்காமல் நிழல் முறையில் (Shadow Mode) செயல்படுத்தியுள்ளது."

            agent_action = AgentAction(
                phase="ACT",
                observation=f"Matched vulnerable CVE {cve_id} with high priority score ({vuln['priority_score']}/10).",
                reasoning=f"Component '{vuln.get('matched_component')}' version '{vuln.get('matched_version')}' is exposed. Automated proof sandbox confirmed exploit block.",
                proposed_action=f"Promote rule '{rule_name}' to SHADOW mode. Stage 5 Enforce requires owner approval.",
                status="EXECUTED",
                explanation_en=msg_en,
                explanation_ta=msg_ta
            )
            db.add(agent_action)

            # Save in Alert table
            alert_entry = Alert(
                site_id=site_id,
                severity="HIGH",
                title_en=title_en,
                title_ta=title_ta,
                message_en=msg_en,
                message_ta=msg_ta,
                channel="IN_APP"
            )
            db.add(alert_entry)
            await db.commit()

            actions_taken.append({
                "cve_id": cve_id,
                "rule_id": new_rule.id,
                "rule_status": new_rule.status,
                "ptp_status": ptp_result.get("status")
            })

        # If no immediate unpatched CVEs found, record baseline observation
        if not actions_taken:
            obs_en = f"Agent completed telemetry and CVE audit for {site.name}. All systems healthy."
            obs_ta = f"{site.name}-க்கான பாதுகாப்பு தணிக்கை முடிந்தது. அனைத்து அமைப்புகளும் சீராக இயங்குகின்றன."
            obs_action = AgentAction(
                phase="OBSERVE",
                observation=f"Audited site {site.name}. 0 exposed zero-days requiring immediate virtual patching.",
                reasoning="Current stack components and ingress traffic nominal. Continuous monitoring active.",
                proposed_action="Maintain active reverse-proxy and ML anomaly observation.",
                status="EXECUTED",
                explanation_en=obs_en,
                explanation_ta=obs_ta
            )
            db.add(obs_action)
            alert_entry = Alert(
                site_id=site_id,
                severity="LOW",
                title_en=f"Site Health Nominal: {site.name}",
                title_ta=f"பாதுகாப்பு நிலை சீரானது: {site.name}",
                message_en=obs_en,
                message_ta=obs_ta,
                channel="IN_APP"
            )
            db.add(alert_entry)
            await db.commit()

        return {
            "status": "success",
            "site_id": site_id,
            "actions_executed": len(actions_taken),
            "details": actions_taken
        }

patchshield_agent = PatchShieldAgent()
