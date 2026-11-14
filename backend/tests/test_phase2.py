import asyncio
from httpx import AsyncClient, ASGITransport
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.core.database import init_db
from app.main import seed_initial_data

def test_health_check():
    async def run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/v1/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "online"
            assert data["service"] == "PatchShield"
    asyncio.run(run())

def test_auth_login():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Invalid password
            bad_resp = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "WrongPassword"})
            assert bad_resp.status_code == 401

            # Correct password
            login_resp = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            assert login_resp.status_code == 200
            token_data = login_resp.json()
            assert "access_token" in token_data
            assert token_data["role"] == "ADMIN"
            token = token_data["access_token"]

            # Verify /me
            me_resp = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert me_resp.status_code == 200
            assert me_resp.json()["username"] == "admin"
    asyncio.run(run())

def test_sites_crud_and_mode_toggle():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Login as admin
            login_resp = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            token = login_resp.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 2. List initial sites (Demo Store must exist)
            sites_resp = await ac.get("/api/v1/sites/", headers=headers)
            assert sites_resp.status_code == 200
            sites = sites_resp.json()
            assert len(sites) >= 1
            demo_site = next(s for s in sites if s["name"] == "Demo Store")
            assert demo_site["upstream_url"] == "http://127.0.0.1:9000"

            # 3. Create a new site
            new_site_payload = {
                "name": "Billing API",
                "domain_or_host": "billing.local",
                "upstream_url": "http://127.0.0.1:8080",
                "listen_port": 8000,
                "security_mode": "PROTECT"
            }
            create_resp = await ac.post("/api/v1/sites/", json=new_site_payload, headers=headers)
            assert create_resp.status_code == 201
            created_site = create_resp.json()
            assert created_site["name"] == "Billing API"
            site_id = created_site["id"]

            # 4. Mode Toggle to STRICT
            mode_resp = await ac.patch(f"/api/v1/sites/{site_id}/mode", json={"security_mode": "STRICT"}, headers=headers)
            assert mode_resp.status_code == 200
            assert mode_resp.json()["security_mode"] == "STRICT"

            # 5. Delete site
            del_resp = await ac.delete(f"/api/v1/sites/{site_id}", headers=headers)
            assert del_resp.status_code == 200
    asyncio.run(run())

def test_gateway_offline_upstream():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Send a request to demo store through the proxy (upstream 9000 is offline)
            proxy_resp = await ac.get("/_proxy/api/test")
            # Should gracefully return 502 with helpful error info
            assert proxy_resp.status_code == 502
            body = proxy_resp.json()
            assert "error" in body
    asyncio.run(run())
