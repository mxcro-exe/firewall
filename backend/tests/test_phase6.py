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
from app.reporting.pdf_generator import generate_executive_security_pdf

def test_pdf_generation():
    pdf_bytes = generate_executive_security_pdf(
        site_name="Demo Store",
        health_score=88,
        active_patches_count=3,
        blocked_count=12,
        kpis={
            "mean_time_to_virtual_patch": "2.4 minutes",
            "exposure_window_reduction": "96.8%",
            "false_block_rate": "0.00%"
        }
    )
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

def test_phase6_apis():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Login
            login = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            token = login.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 1. Get sites
            sites = (await ac.get("/api/v1/sites/", headers=headers)).json()
            site_id = sites[0]["id"]

            # Add component to inventory to test patch synthesis
            await ac.post(f"/api/v1/inventory/{site_id}/manual", json={
                "component_name": "storefront",
                "version": "2.4.0"
            }, headers=headers)

            # 2. Trigger Agent OODA cycle
            agent_resp = await ac.post(f"/api/v1/agent/run-cycle/{site_id}", headers=headers)
            assert agent_resp.status_code == 200
            assert "actions_executed" in agent_resp.json()

            # 3. Check agent timeline
            timeline_resp = await ac.get("/api/v1/agent/timeline", headers=headers)
            assert timeline_resp.status_code == 200
            actions = timeline_resp.json()
            assert len(actions) >= 1
            latest_action = actions[0]
            assert "explanation_en" in latest_action
            assert "explanation_ta" in latest_action

            # 4. Check bilingual alerts
            alerts_resp = await ac.get("/api/v1/alerts/", headers=headers)
            assert alerts_resp.status_code == 200
            alerts = alerts_resp.json()
            assert len(alerts) >= 1
            assert "title_ta" in alerts[0]

            # 5. Check PS5 metrics
            metrics_resp = await ac.get("/api/v1/metrics/", headers=headers)
            assert metrics_resp.status_code == 200
            data = metrics_resp.json()
            assert "kpis" in data
            assert data["kpis"]["exposure_window_reduction"] == "96.8%"
            assert "timeline" in data

            # 6. Check health score
            health_resp = await ac.get(f"/api/v1/health/{site_id}", headers=headers)
            assert health_resp.status_code == 200
            health_data = health_resp.json()
            assert "health_score" in health_data
            assert "top_fixes" in health_data

            # 7. Check PDF report endpoint
            pdf_resp = await ac.get("/api/v1/reports/pdf", headers=headers)
            assert pdf_resp.status_code == 200
            assert pdf_resp.headers["content-type"] == "application/pdf"

    asyncio.run(run())
