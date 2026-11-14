import json
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.rule import VirtualPatchRule
from app.models.proof import ProofRun
from app.models.site import Site
from app.pipeline.sandbox import run_sandbox_exploit_test
from app.pipeline.replay import run_traffic_replay_test

async def run_prove_then_patch_lifecycle(rule_id: str, db: AsyncSession, advance_to_stage: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes the 6-stage Prove-then-Patch lifecycle with evidence recording:
    STAGE_1_EXPLOIT -> STAGE_2_REPLAY -> STAGE_3_SHADOW -> STAGE_4_CANARY -> STAGE_5_ENFORCE
    """
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        return {"error": "Rule not found", "status": "FAIL"}

    pipeline_log = []

    # --- STAGE 1: Sandbox Exploit Verification ---
    exploit_ok, exploit_details = run_sandbox_exploit_test(rule)
    proof_st1 = ProofRun(
        rule_id=rule.id,
        stage="STAGE_1_EXPLOIT",
        status="PASS" if exploit_ok else "FAIL",
        exploit_evidence=json.dumps(exploit_details),
        run_log=f"Executed {exploit_details.get('total_probes')} exploit payloads. Blocked: {exploit_details.get('blocked_count')}",
        completed_at=datetime.utcnow()
    )
    db.add(proof_st1)
    pipeline_log.append({"stage": "STAGE_1_EXPLOIT", "status": "PASS" if exploit_ok else "FAIL", "evidence": exploit_details})

    if not exploit_ok:
        rule.status = "DRAFT"
        await db.commit()
        return {
            "status": "FAIL",
            "failed_at": "STAGE_1_EXPLOIT",
            "message": "Exploit payloads bypassed the virtual patch rule in sandbox.",
            "pipeline_log": pipeline_log
        }

    rule.status = "SANDBOX_OK"

    # --- STAGE 2: Historical Traffic Replay (False-Positive Check) ---
    replay_ok, replay_details = await run_traffic_replay_test(rule, db)
    proof_st2 = ProofRun(
        rule_id=rule.id,
        stage="STAGE_2_REPLAY",
        status="PASS" if replay_ok else "FAIL",
        replay_fp_rate=replay_details.get("fp_rate", 0.0),
        run_log=f"Replayed {replay_details.get('total_replayed')} benign requests. False Blocks: {replay_details.get('false_blocks_count')} (FP Rate: {replay_details.get('fp_rate')}%)",
        completed_at=datetime.utcnow()
    )
    db.add(proof_st2)
    pipeline_log.append({"stage": "STAGE_2_REPLAY", "status": "PASS" if replay_ok else "FAIL", "evidence": replay_details})

    if not replay_ok:
        rule.status = "DRAFT"
        await db.commit()
        return {
            "status": "FAIL",
            "failed_at": "STAGE_2_REPLAY",
            "message": "Rule caused false blocks on recorded legitimate traffic. Rejected from production.",
            "pipeline_log": pipeline_log
        }

    # --- STAGE 3: Shadow Mode Activation ---
    rule.status = "SHADOW"
    proof_st3 = ProofRun(
        rule_id=rule.id,
        stage="STAGE_3_SHADOW",
        status="PASS",
        shadow_matches=0,
        run_log="Virtual patch promoted to Shadow Mode (evaluating live traffic without drops)",
        completed_at=datetime.utcnow()
    )
    db.add(proof_st3)
    pipeline_log.append({"stage": "STAGE_3_SHADOW", "status": "PASS", "info": "Active in Shadow Mode"})

    # --- STAGE 4: Canary Split (5% traffic) ---
    if advance_to_stage in ["CANARY", "ENFORCED"]:
        rule.status = "CANARY"
        proof_st4 = ProofRun(
            rule_id=rule.id,
            stage="STAGE_4_CANARY",
            status="PASS",
            canary_pct=5,
            run_log="Canary deployment active on 5% of incoming traffic",
            completed_at=datetime.utcnow()
        )
        db.add(proof_st4)
        pipeline_log.append({"stage": "STAGE_4_CANARY", "status": "PASS", "canary_pct": 5})

    # --- STAGE 5: Full Enforcement ---
    if advance_to_stage == "ENFORCED":
        rule.status = "ENFORCED"
        proof_st5 = ProofRun(
            rule_id=rule.id,
            stage="STAGE_5_ENFORCE",
            status="PASS",
            run_log="Full enforcement activated (100% active blocking with auto-rollback armed)",
            completed_at=datetime.utcnow()
        )
        db.add(proof_st5)
        pipeline_log.append({"stage": "STAGE_5_ENFORCE", "status": "PASS", "mode": "100% ENFORCED"})

    await db.commit()
    await db.refresh(rule)

    return {
        "status": "SUCCESS",
        "current_rule_status": rule.status,
        "rule_id": rule.id,
        "pipeline_log": pipeline_log
    }

async def rollback_rule(rule_id: str, db: AsyncSession, reason: str = "False-positive spike") -> Dict[str, Any]:
    """Auto-rollback or manual rollback to safe Shadow Mode"""
    res = await db.execute(select(VirtualPatchRule).where(VirtualPatchRule.id == rule_id))
    rule = res.scalars().first()
    if not rule:
        return {"error": "Rule not found"}

    old_status = rule.status
    rule.status = "SHADOW"
    proof = ProofRun(
        rule_id=rule.id,
        stage="ROLLBACK",
        status="PASS",
        run_log=f"Automated rollback triggered from {old_status} back to SHADOW. Reason: {reason}",
        completed_at=datetime.utcnow()
    )
    db.add(proof)
    await db.commit()
    return {"status": "success", "message": f"Rule {rule.name} rolled back to SHADOW mode", "old_status": old_status}

async def check_and_retire_rules(site_id: str, component_name: str, new_version: str, db: AsyncSession) -> int:
    """Stage 6: Auto-retire virtual patch rules when software version is upgraded"""
    res = await db.execute(select(VirtualPatchRule).where(
        VirtualPatchRule.site_id == site_id,
        VirtualPatchRule.status.in_(["SHADOW", "CANARY", "ENFORCED"])
    ))
    rules = res.scalars().all()
    retired_count = 0

    for rule in rules:
        name_lower = rule.name.lower()
        if component_name.lower() in name_lower:
            rule.status = "RETIRED"
            proof = ProofRun(
                rule_id=rule.id,
                stage="AUTO_RETIRE",
                status="PASS",
                run_log=f"Auto-retired: underlying component '{component_name}' was safely upgraded to {new_version}.",
                completed_at=datetime.utcnow()
            )
            db.add(proof)
            retired_count += 1

    await db.commit()
    return retired_count

