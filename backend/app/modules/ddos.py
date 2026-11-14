import time
from collections import defaultdict
from typing import Tuple, Dict, Any

class DDoSProtectionModule:
    def __init__(self):
        # ip -> list of timestamps
        self.request_records = defaultdict(list)
        # ip -> ban_expiry_timestamp
        self.banned_ips = {}
        self.rate_limit_per_min = 60
        self.temp_ban_seconds = 600  # 10 minutes

    def is_ip_banned(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip in self.banned_ips:
            if now < self.banned_ips[client_ip]:
                return True
            else:
                del self.banned_ips[client_ip]
        return False

    def inspect(self, client_ip: str) -> Tuple[bool, str, Dict[str, Any]]:
        now = time.time()
        if self.is_ip_banned(client_ip):
            remaining = int(self.banned_ips[client_ip] - now)
            return True, f"IP temporarily banned for excessive traffic (remaining {remaining}s)", {"banned": True}

        # Clean old timestamps (> 60s)
        self.request_records[client_ip] = [ts for ts in self.request_records[client_ip] if now - ts < 60]
        self.request_records[client_ip].append(now)

        req_count = len(self.request_records[client_ip])
        if req_count > self.rate_limit_per_min:
            # Trigger ban
            self.banned_ips[client_ip] = now + self.temp_ban_seconds
            return True, f"Rate limit exceeded ({req_count} req/min). Temporary ban applied for 10 minutes.", {"rate_exceeded": True}

        return False, "", {"current_rate_per_min": req_count}

ddos_module = DDoSProtectionModule()
