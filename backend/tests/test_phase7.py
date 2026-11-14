"""
Phase 7 Verification Tests:
- Deliberately vulnerable Demo App functionality
- End-to-end Attack Simulator verification through gateway proxy
- Prove-then-Patch active rule and attack module mitigation
"""
import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parent.parent
project_root = backend_path.parent
sys.path.insert(0, str(backend_path))
sys.path.insert(0, str(project_root))

import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app, seed_initial_data
from app.core.database import init_db
from demo_lab.app import app as demo_app

def test_demo_vulnerable_app_endpoints():
    async def run():
        transport = ASGITransport(app=demo_app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Normal benign request
            res = await client.get("/api/products?q=coffee")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "success"
            assert data["count"] >= 1
            assert len(data["products"]) >= 1

            # 2. Vulnerable SQLi endpoint executes if unshielded
            res = await client.get("/api/products?q=coffee' UNION SELECT 1, 'Hacked Item', 999.0, 'vulnerable' --")
            assert res.status_code == 200
            data = res.json()
            assert isinstance(data, dict)
            assert data.get("vulnerable_simulation") is True
            assert "PostgreSQL" in data.get("leaked_database_version", "")

            # 3. Vulnerable Path Traversal executes if unshielded
            res = await client.get("/api/preview?filename=../../secret.txt")
            assert res.status_code == 200
            assert "root:x:0:0" in res.json().get("file_contents", "")
    asyncio.run(run())

def test_gateway_mitigation_on_simulated_attacks():
    async def run():
        await init_db()
        await seed_initial_data()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Login as admin
            login_resp = await client.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            assert login_resp.status_code == 200
            token = login_resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # Fetch sites
            sites_res = await client.get("/api/v1/sites/", headers=headers)
            assert sites_res.status_code == 200
            site_id = sites_res.json()[0]["id"]

            # Test SQLi attack through gateway -> must be blocked 403 by SQLi module
            res = await client.get(
                f"/proxy/{site_id}/api/products?q=1'+UNION+SELECT+1,2,3--",
                headers={"user-agent": "Mozilla/5.0"}
            )
            assert res.status_code == 403
            assert "SQL" in res.json().get("reason", "") or "SQL" in res.json().get("error", "")

            # Test Path Traversal attack through gateway -> must be blocked 403
            res = await client.get(
                f"/proxy/{site_id}/api/preview?filename=../../../../etc/passwd",
                headers={"user-agent": "Mozilla/5.0"}
            )
            assert res.status_code == 403
            assert "Traversal" in res.json().get("reason", "") or "Traversal" in res.json().get("error", "")

            # Test Scanner Bot User-Agent -> must be blocked 403
            res = await client.get(f"/proxy/{site_id}/api/products", headers={"user-agent": "sqlmap/1.5"})
            assert res.status_code == 403

            # Test Honeypot -> returns 404 fake trap
            res = await client.get(f"/proxy/{site_id}/.env")
            assert res.status_code == 404
    asyncio.run(run())
