import re
import time
import asyncio
import pytest
import ipaddress
import sys
from pathlib import Path
from httpx import AsyncClient, ASGITransport

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.core.kv_cache import kv_cache
from app.rules.redos_guard import ReDoSStaticAnalyzer, safe_regex_matcher
from app.gateway.streaming_proxy import streaming_proxy
from app.gateway.packet_filter import packet_filter
from app.pipeline.isolated_sandbox import isolated_sandbox_runner

# =========================================================================
# TRACK 1 TESTS: Streaming Reverse Proxy & Hop-by-Hop Filtering
# =========================================================================
def test_track1_streaming_proxy_headers_and_ip():
    class DummyURL:
        scheme = "https"
    class DummyRequest:
        url = DummyURL()
        headers = {
            "Host": "api.shop.local:8000",
            "X-Forwarded-For": "203.0.113.195",
            "Connection": "keep-alive",
            "Transfer-Encoding": "chunked",
            "User-Agent": "Mozilla/5.0",
            "CF-Connecting-IP": "198.51.100.42"
        }
        client = None

    req = DummyRequest()
    client_ip = streaming_proxy.extract_client_ip(req)
    # Cloudflare header should take precedence
    assert client_ip == "198.51.100.42"

    forwarded = streaming_proxy.filter_forward_headers(req, client_ip)
    # Hop-by-hop headers must be stripped
    assert "connection" not in [k.lower() for k in forwarded.keys()]
    assert "transfer-encoding" not in [k.lower() for k in forwarded.keys()]
    assert "host" not in [k.lower() for k in forwarded.keys()]
    assert forwarded["X-Forwarded-For"] == "203.0.113.195, 198.51.100.42"
    assert forwarded["X-PatchShield-Gateway"] == "Streaming-v2.0"

# =========================================================================
# TRACK 2 TESTS: ReDoS-Proof AST Analyzer & Matcher Timeout
# =========================================================================
def test_track2_redos_ast_analyzer():
    # 1. Evil exponential backtracking patterns
    evil_patterns = [
        r"(a+)+$",
        r"([a-zA-Z]+)*$",
        r"(a|aa)+$",
        r"((.*)*)*",
        r"(0|1)+$"
    ]
    for pattern in evil_patterns[:4]:
        is_safe, reason = ReDoSStaticAnalyzer.analyze_ast(pattern)
        assert is_safe is False, f"Expected {pattern} to be flagged as unsafe ReDoS"
        assert "exponential backtracking" in reason or "Nested" in reason

    # 2. Benign safe WAF patterns
    safe_patterns = [
        r"union\s+select",
        r"<script[^>]*>",
        r"\.\./\.\./etc/passwd",
        r";\s*(cat|whoami|id)\b"
    ]
    for pattern in safe_patterns:
        is_safe, reason = ReDoSStaticAnalyzer.analyze_ast(pattern)
        assert is_safe is True, f"Expected {pattern} to be deemed safe, but got: {reason}"

def test_track2_safe_regex_matcher_performance():
    pattern = re.compile(r"union\s+select", re.IGNORECASE)
    matched, match_obj, elapsed_ms = safe_regex_matcher.match_with_timeout(pattern, "SELECT * FROM users UNION SELECT 1,2,3")
    assert matched is True
    assert elapsed_ms < 10.0 # Sub-10ms match

# =========================================================================
# TRACK 3 TESTS: Microsecond In-Memory Ban & Rate Limiting Cache
# =========================================================================
def test_track3_kv_cache_and_sliding_window():
    async def run():
        # 1. O(1) TTL Key-Value Test
        await kv_cache.set("session:test", "active_data", ttl_seconds=1)
        val = await kv_cache.get("session:test")
        assert val == "active_data"

        # 2. Banned IP & CIDR Test
        await kv_cache.ban_ip("192.0.2.1", duration_seconds=60)
        is_banned, reason = kv_cache.is_ip_banned("192.0.2.1")
        assert is_banned is True
        assert "temporarily banned" in reason

        # Subnet ban test
        kv_cache.add_banned_cidr("10.99.0.0/16")
        is_subnet_banned, _ = kv_cache.is_ip_banned("10.99.4.55")
        assert is_subnet_banned is True

        is_clean_ip_banned, _ = kv_cache.is_ip_banned("8.8.8.8")
        assert is_clean_ip_banned is False

        # 3. Sliding Window Rate Limiter Test (Burst allowance)
        test_ip = "198.51.100.99"
        for _ in range(5):
            allowed, count, _ = kv_cache.check_sliding_window_rate_limit(f"rate:{test_ip}", max_requests=5, window_seconds=10.0)
            assert allowed is True

        # 6th request must be rejected
        allowed_overflow, count, retry_after = kv_cache.check_sliding_window_rate_limit(f"rate:{test_ip}", max_requests=5, window_seconds=10.0)
        assert allowed_overflow is False
        assert retry_after > 0

    asyncio.run(run())

# =========================================================================
# TRACK 4 TESTS: Isolated Exploit Sandbox Execution
# =========================================================================
def test_track4_isolated_sandbox_runner():
    async def run():
        # Environment sanitization test
        clean_env = isolated_sandbox_runner.build_sanitized_environment()
        assert "SECRET_KEY" not in clean_env
        assert "JWT_SECRET" not in clean_env
        assert clean_env.get("PATCHSHIELD_SANDBOX") == "1"

        # Verification test against safe exploit vectors
        rule_pattern = r"(union\s+select|\.\./\.\./)"
        exploit_samples = [
            "' UNION SELECT 1,2,3--",
            "../../etc/passwd"
        ]
        all_blocked, diagnostics = await isolated_sandbox_runner.execute_isolated_verification(
            rule_pattern=rule_pattern,
            exploit_payloads=exploit_samples
        )
        assert all_blocked is True
        assert len(diagnostics) == 2
        for diag in diagnostics:
            assert diag["blocked"] is True
            assert diag["sandbox_status"] == "CONTAINED"

    asyncio.run(run())

# =========================================================================
# TRACK 5 TESTS: Low-Level Packet Inspection & TCP Drops
# =========================================================================
def test_track5_packet_filter_instant_drop():
    # 1. Weaponized scanner agent should drop immediately
    should_drop, reason = packet_filter.should_instant_drop("1.2.3.4", user_agent="masscan/1.3")
    assert should_drop is True
    assert "masscan" in reason

    # 2. Normal customer browser should not drop
    normal_drop, _ = packet_filter.should_instant_drop("1.2.3.4", user_agent="Mozilla/5.0 Chrome/120")
    assert normal_drop is False

    # 3. Connection close response check
    drop_resp = packet_filter.create_instant_drop_response("Test Drop")
    assert drop_resp.status_code == 403
    assert drop_resp.headers["Connection"] == "close"
    assert drop_resp.headers["X-PatchShield-Action"] == "TCP_DROP"
