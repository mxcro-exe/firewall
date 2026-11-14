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
from app.modules.sqli import sqli_module
from app.modules.xss import xss_module
from app.modules.path_traversal import path_module
from app.modules.cmd_injection import cmd_module
from app.modules.bot_scraper import bot_module
from app.gateway.honeypot import is_honeypot_path
from app.ml.model_runner import ml_subsystem

def test_attack_defense_detectors():
    # 1. SQLi
    blocked, reason, _ = sqli_module.inspect("admin' OR 1=1 --")
    assert blocked is True
    assert "SQL Injection detected" in reason

    # 2. XSS
    blocked_xss, _, _ = xss_module.inspect("<script>alert(1)</script>")
    assert blocked_xss is True

    # 3. Path Traversal
    blocked_pt, _, _ = path_module.inspect("../../../../etc/passwd")
    assert blocked_pt is True

    # 4. Command Injection
    blocked_cmd, _, _ = cmd_module.inspect("; cat /etc/passwd")
    assert blocked_cmd is True

    # 5. Bot scraper User-Agent
    blocked_bot, _, _ = bot_module.inspect("sqlmap/1.6.4#stable", "/api/test")
    assert blocked_bot is True

def test_honeypot_detection():
    is_honey, msg = is_honeypot_path("/wp-login.php")
    assert is_honey is True

    is_honey_env, _ = is_honeypot_path("/.env")
    assert is_honey_env is True

    is_normal, _ = is_honeypot_path("/api/products")
    assert is_normal is False

def test_ml_subsystem_inference():
    res = ml_subsystem.predict(
        method="GET",
        path="/api/products",
        query_string="q=admin'+UNION+SELECT+1,2,3--"
    )
    assert res is not None
    assert "prediction" in res
    assert "confidence" in res
    assert "top_features" in res
    assert len(res["top_features"]) <= 3

def test_attack_modules_api():
    async def run():
        await init_db()
        await seed_initial_data()
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Login
            login = await ac.post("/api/v1/auth/login", json={"username": "admin", "password": "Admin@123!"})
            token = login.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            # 1. List modules (must return 7 modules)
            mods_resp = await ac.get("/api/v1/attack-modules/", headers=headers)
            assert mods_resp.status_code == 200
            mods = mods_resp.json()
            assert len(mods) == 7

            # 2. Toggle module
            toggle_resp = await ac.patch("/api/v1/attack-modules/sqli/toggle", headers=headers)
            assert toggle_resp.status_code == 200
            assert toggle_resp.json()["module_key"] == "sqli"
            assert toggle_resp.json()["is_enabled"] is False

            # Toggle back to True for subsequent tests
            toggle_back = await ac.patch("/api/v1/attack-modules/sqli/toggle", headers=headers)
            assert toggle_back.json()["is_enabled"] is True

            # 3. ML status check
            ml_resp = await ac.get("/api/v1/attack-modules/ml/status", headers=headers)
            assert ml_resp.status_code == 200
            assert "supported_classes" in ml_resp.json()

    asyncio.run(run())
