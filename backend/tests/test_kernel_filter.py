import sys
import asyncio
from pathlib import Path
from httpx import AsyncClient, ASGITransport

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app
from app.network.kernel_filter import kernel_firewall
from app.core.kv_cache import kv_cache

def test_kernel_firewall_rule_injection_and_removal():
    test_ip = "203.0.113.88"
    
    # 1. Inject Kernel Drop Rule
    success, msg = kernel_firewall.inject_kernel_drop(test_ip, "Test Exploit Ingress")
    assert success is True
    assert test_ip in kernel_firewall.active_kernel_rules

    # 2. Check Status
    status = kernel_firewall.get_status()
    assert status["active_kernel_rules_count"] >= 1
    assert test_ip in status["banned_ips"]
    assert "kernel_backend" in status

    # 3. Remove Kernel Drop Rule
    success_rm, msg_rm = kernel_firewall.remove_kernel_drop(test_ip)
    assert success_rm is True
    assert test_ip not in kernel_firewall.active_kernel_rules

def test_kv_cache_triggers_kernel_filter():
    async def run():
        test_ip = "198.51.100.99"
        await kv_cache.ban_ip(test_ip, duration_seconds=60, reason="SQLi Probe")
        
        # Verify IP was synced into kernel firewall
        assert test_ip in kernel_firewall.active_kernel_rules
        
        # Unban and verify removal
        await kv_cache.unban_ip(test_ip)
        assert test_ip not in kernel_firewall.active_kernel_rules

    asyncio.run(run())

def test_kernel_status_api_endpoint():
    async def run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/kernel/status")
            assert res.status_code == 200
            data = res.json()
            assert "kernel_backend" in data
            assert "os" in data
            assert "features" in data
            assert len(data["features"]) > 0

    asyncio.run(run())
