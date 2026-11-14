from typing import Tuple, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.rule import VirtualPatchRule
from app.models.traffic import TrafficLog
from app.rules.engine import rule_engine

# Standard benign traffic fixtures for route regression testing
BASELINE_BENIGN_TRAFFIC = [
    {"query": "q=fresh+vegetables&page=1", "body": ""},
    {"query": "q=cotton+saree&sort=price_asc", "body": ""},
    {"query": "category=electronics&limit=20", "body": ""},
    {"query": "id=10492&locale=en_IN", "body": ""},
    {"query": "", "body": '{"product_id": 402, "quantity": 2, "notes": "Deliver before 6 PM"}'},
    {"query": "filename=invoice_march_2026.pdf", "body": ""},
    {"query": "view=receipt&order_id=ORD-9912", "body": ""},
    {"query": "action=login&remember=true", "body": '{"username": "kumar_retail", "client": "mobile"}'},
    {"query": "search=masala+tea+powder", "body": ""},
    {"query": "filter=in_stock&brand=tata", "body": ""}
]

async def run_traffic_replay_test(rule: VirtualPatchRule, db: AsyncSession) -> Tuple[bool, Dict[str, Any]]:
    """
    Stage 2: Replay recorded legitimate traffic through the virtual patch rule.
    Must achieve 0% False-Positive rate to pass.
    """
    # 1. Fetch real historical traffic for this endpoint if available
    res = await db.execute(
        select(TrafficLog).where(
            TrafficLog.site_id == rule.site_id,
            TrafficLog.rule_action == "PASSED"
        ).limit(100)
    )
    historical_logs = res.scalars().all()

    requests_to_replay = []
    for log in historical_logs:
        requests_to_replay.append({
            "query": log.query_params_sanitized or "",
            "body": log.body_sanitized or ""
        })

    # If new site with minimal logs, combine with baseline benign fixtures
    if len(requests_to_replay) < 10:
        requests_to_replay.extend(BASELINE_BENIGN_TRAFFIC)

    false_blocks = []
    total = len(requests_to_replay)

    for req in requests_to_replay:
        matched, details = rule_engine.evaluate(
            method=rule.http_method if rule.http_method != "ANY" else "GET",
            path=rule.endpoint_path,
            query_string=req["query"],
            body_text=req["body"],
            rules=[rule]
        )
        if matched:
            false_blocks.append({
                "query": req["query"],
                "body": req["body"][:100],
                "tripped_pattern": details.get("matched_text")
            })

    fp_rate = round(len(false_blocks) / total if total > 0 else 0.0, 4)
    is_clean = (len(false_blocks) == 0)

    return is_clean, {
        "total_replayed": total,
        "false_blocks_count": len(false_blocks),
        "fp_rate": fp_rate,
        "status": "PASS" if is_clean else "FAIL",
        "sample_violations": false_blocks[:3]
    }
