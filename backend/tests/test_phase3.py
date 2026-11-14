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
from app.intel.inventory import parse_manifest_content
from app.intel.matching import compare_versions

def test_manifest_parsing():
    # 1. Test requirements.txt
    req_content = """
    fastapi==0.104.1
    uvicorn>=0.23.0
    storefront==2.4.0
    requests~=2.28.1
    # comment line
    """
    parsed_req = parse_manifest_content("requirements.txt", req_content)
    names = [p["name"] for p in parsed_req]
    assert "fastapi" in names
    assert "storefront" in names
    assert next(p for p in parsed_req if p["name"] == "storefront")["version"] == "2.4.0"

    # 2. Test package.json
    pkg_content = """
    {
      "dependencies": {
        "express": "^4.17.1",
        "lodash": "~4.17.20"
      }
    }
    """
    parsed_pkg = parse_manifest_content("package.json", pkg_content)
    assert len(parsed_pkg) == 2
    assert any(p["name"] == "express" and p["version"] == "4.17.1" for p in parsed_pkg)

def test_version_comparison():
    assert compare_versions("2.4.0", "<= 2.4.0") == "AFFECTED"
    assert compare_versions("2.4.1", "<= 2.4.0") == "NOT_AFFECTED"
    assert compare_versions("5.18.2", "< 5.18.3") == "AFFECTED"
    assert compare_versions("5.18.4", "< 5.18.3") == "NOT_AFFECTED"
    assert compare_versions("unknown", "< 5.18.3") == "UNSURE"

def test_cve_sync_and_exposure_api():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Login
            login = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            token = login.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 1. Verify CVE feed exists and has data
            cve_resp = await ac.get("/api/v1/cve/", headers=headers)
            assert cve_resp.status_code == 200
            cves = cve_resp.json()
            assert len(cves) >= 5
            assert any(c["cve_id"] == "CVE-2023-38606" for c in cves)

            # 2. Get demo site ID
            sites = (await ac.get("/api/v1/sites/", headers=headers)).json()
            site_id = sites[0]["id"]

            # 3. Add vulnerable component manually to stack inventory
            comp_resp = await ac.post(f"/api/v1/inventory/{site_id}/manual", json={
                "component_name": "storefront",
                "version": "2.4.0"
            }, headers=headers)
            assert comp_resp.status_code == 200

            # 4. Run exposure matching
            exposure_resp = await ac.get(f"/api/v1/inventory/{site_id}/exposure", headers=headers)
            assert exposure_resp.status_code == 200
            matches = exposure_resp.json()
            assert len(matches) >= 5

            # Must flag CVE-2023-38606 as AFFECTED!
            matched_cve = next(m for m in matches if m["cve_id"] == "CVE-2023-38606")
            assert matched_cve["status"] == "AFFECTED"
            assert "storefront" in matched_cve["reason"]

    asyncio.run(run())
