import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.core.database import init_db
from app.main import seed_initial_data
from app.rules.normalizer import normalize_string
from app.rules.engine import rule_engine
from app.models.rule import VirtualPatchRule

def test_obfuscation_normalizer():
    # 1. URL double decoding
    t1, ob1, tech1 = normalize_string("%252e%252e%252f")
    assert "../" in t1
    assert ob1 is True

    # 2. SQL comment stripping
    t2, ob2, tech2 = normalize_string("SEL/**/ECT 1")
    assert "SELECT 1" in t2
    assert "sql_comment_bypass" in tech2

    # 3. HTML entities
    t3, ob3, tech3 = normalize_string("&lt;script&gt;")
    assert "<script>" in t3

def test_scoped_rule_evaluation():
    rule = VirtualPatchRule(
        name="SQLi Test",
        http_method="GET",
        endpoint_path="/api/products",
        target_param="q",
        pattern_value=r"(?i)(\bUNION\b|--|1=1)",
        status="ENFORCED",
        version=1,
        is_active=True
    )

    # 1. Matching attack request
    matched, details = rule_engine.evaluate(
        method="GET",
        path="/api/products",
        query_string="q=shoes'+UNION+SELECT+1--",
        body_text="",
        rules=[rule]
    )
    assert matched is not None
    assert details["target_param"] == "q"

    # 2. Benign request to same endpoint
    matched_benign, _ = rule_engine.evaluate(
        method="GET",
        path="/api/products",
        query_string="q=blue+running+shoes&page=1",
        body_text="",
        rules=[rule]
    )
    assert matched_benign is None

    # 3. Wrong endpoint (scoped protection)
    matched_other, _ = rule_engine.evaluate(
        method="GET",
        path="/api/users",
        query_string="q=shoes'+UNION+SELECT+1--",
        body_text="",
        rules=[rule]
    )
    assert matched_other is None

def test_prove_then_patch_lifecycle_api():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Login
            login = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            token = login.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            sites = (await ac.get("/api/v1/sites/", headers=headers)).json()
            site_id = sites[0]["id"]

            # 1. Create a draft virtual patch rule
            create_resp = await ac.post("/api/v1/rules/", json={
                "site_id": site_id,
                "name": "Storefront SQLi Shield",
                "cve_id": "CVE-2023-38606",
                "http_method": "GET",
                "endpoint_path": "/api/products",
                "target_param": "q",
                "pattern_value": r"(?i)(\b(SELECT|UNION)\b|--|1=1)",
                "explanation_en": "Blocks SQLi on q parameter",
                "explanation_ta": "SQL தாக்குதலை தடுக்கிறது"
            }, headers=headers)
            assert create_resp.status_code == 201
            rule = create_resp.json()
            rule_id = rule["id"]
            assert rule["status"] == "DRAFT"

            # 2. Run Prove-then-Patch stepper to Full Enforce
            run_resp = await ac.post(f"/api/v1/prove-patch/{rule_id}/run", json={
                "advance_to_stage": "ENFORCED"
            }, headers=headers)
            assert run_resp.status_code == 200
            result = run_resp.json()
            assert result["status"] == "SUCCESS"
            assert result["current_rule_status"] == "ENFORCED"

            # 3. Verify evidence logs recorded
            ev_resp = await ac.get(f"/api/v1/prove-patch/{rule_id}/evidence", headers=headers)
            assert ev_resp.status_code == 200
            evidence = ev_resp.json()
            stages = [e["stage"] for e in evidence]
            assert "STAGE_1_EXPLOIT" in stages
            assert "STAGE_2_REPLAY" in stages

            # 4. Rollback rule
            rb_resp = await ac.post(f"/api/v1/prove-patch/{rule_id}/rollback", json={
                "reason": "Test safety rollback"
            }, headers=headers)
            assert rb_resp.status_code == 200
            assert rb_resp.json()["status"] == "success"

    asyncio.run(run())

