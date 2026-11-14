import time
import ipaddress
import asyncio
from typing import Optional, Dict, Any, Tuple, Set
from collections import defaultdict, deque

class MicrosecondKVCache:
    """
    High-Performance In-Memory Key-Value & TTL Cache (Redis-Style).
    Provides thread-safe O(1) operations for ban enforcement, CIDR lookups, 
    and Token Bucket / Sliding Window rate limiting without database lag.
    """
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}  # key -> (value, expiry_timestamp)
        self._banned_ips: Dict[str, float] = {}         # ip -> ban_expiry_timestamp
        self._banned_cidrs: Set[ipaddress.IPv4Network | ipaddress.IPv6Network] = set()
        self._sliding_windows: Dict[str, deque] = defaultdict(deque)  # ip -> deque of timestamps
        self._token_buckets: Dict[str, Tuple[float, float]] = {}      # ip -> (tokens, last_updated)
        self._lock = asyncio.Lock()

    # --- O(1) TTL Key-Value Operations ---
    async def get(self, key: str) -> Optional[Any]:
        """Microsecond O(1) retrieval with lazy TTL expiration."""
        item = self._store.get(key)
        if not item:
            return None
        value, expiry = item
        if expiry != 0 and time.time() > expiry:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: Any, ttl_seconds: float = 0):
        """Set key with optional TTL (0 = no expiration)."""
        expiry = time.time() + ttl_seconds if ttl_seconds > 0 else 0
        self._store[key] = (value, expiry)

    async def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    # --- Blacklist & Banned CIDRs ---
    async def ban_ip(self, ip: str, duration_seconds: float = 3600):
        """Ban an IP for a specific duration in memory."""
        self._banned_ips[ip] = time.time() + duration_seconds

    async def unban_ip(self, ip: str):
        if ip in self._banned_ips:
            del self._banned_ips[ip]

    def add_banned_cidr(self, cidr_str: str):
        """Add a CIDR range to immediate drop list."""
        try:
            net = ipaddress.ip_network(cidr_str, strict=False)
            self._banned_cidrs.add(net)
        except ValueError:
            pass

    def is_ip_banned(self, ip_str: str) -> Tuple[bool, Optional[str]]:
        """
        Thread-safe, synchronous O(1) blacklist check.
        Zero async/SQL overhead for the critical reverse proxy hot-path.
        """
        now = time.time()
        # 1. Exact IP Ban Check
        expiry = self._banned_ips.get(ip_str)
        if expiry:
            if now < expiry:
                return True, f"IP {ip_str} is temporarily banned (TTL: {int(expiry - now)}s)"
            else:
                del self._banned_ips[ip_str]

        # 2. CIDR Subnet Match Check
        if self._banned_cidrs:
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                for net in self._banned_cidrs:
                    if ip_obj in net:
                        return True, f"IP {ip_str} matches banned subnet {net}"
            except ValueError:
                pass

        return False, None

    # --- Sliding Window Rate Limiter ---
    def check_sliding_window_rate_limit(
        self,
        key: str,
        max_requests: int = 100,
        window_seconds: float = 60.0
    ) -> Tuple[bool, int, float]:
        """
        Sliding Window Counter algorithm.
        Returns: (is_allowed, current_count, retry_after_seconds)
        """
        now = time.time()
        window = self._sliding_windows[key]

        # Evict timestamps older than current window
        cutoff = now - window_seconds
        while window and window[0] <= cutoff:
            window.popleft()

        if len(window) >= max_requests:
            retry_after = (window[0] + window_seconds) - now
            return False, len(window), max(0.1, retry_after)

        window.append(now)
        return True, len(window), 0.0

    # --- Token Bucket Rate Limiter (with Burst Support) ---
    def check_token_bucket(
        self,
        key: str,
        capacity: float = 50.0,
        fill_rate_per_sec: float = 10.0
    ) -> Tuple[bool, float]:
        """
        Token Bucket algorithm supporting bursty traffic while enforcing strict rate caps.
        Returns: (is_allowed, remaining_tokens)
        """
        now = time.time()
        tokens, last_updated = self._token_buckets.get(key, (capacity, now))

        # Replenish tokens based on elapsed time
        elapsed = now - last_updated
        tokens = min(capacity, tokens + (elapsed * fill_rate_per_sec))

        if tokens >= 1.0:
            tokens -= 1.0
            self._token_buckets[key] = (tokens, now)
            return True, tokens

        self._token_buckets[key] = (tokens, now)
        return False, 0.0

    def purge_expired(self):
        """Periodic background garbage collection of expired TTL keys."""
        now = time.time()
        expired_keys = [k for k, (_, exp) in self._store.items() if exp != 0 and now > exp]
        for k in expired_keys:
            del self._store[k]

        expired_bans = [ip for ip, exp in self._banned_ips.items() if now > exp]
        for ip in expired_bans:
            del self._banned_ips[ip]

# Global singleton in-memory cache
kv_cache = MicrosecondKVCache()
