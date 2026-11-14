import time
from collections import defaultdict
from typing import Tuple, Dict, Any

class BruteForceDefenseModule:
    def __init__(self):
        # (ip, endpoint) -> list of failed attempt timestamps
        self.failed_attempts = defaultdict(list)
        # (ip, endpoint) -> lockout_until
        self.lockouts = {}
        self.max_failures = 5
        self.window_seconds = 300  # 5 minutes
        self.lockout_seconds = 900  # 15 minutes

    def record_failure(self, client_ip: str, path: str):
        now = time.time()
        key = (client_ip, path)
        self.failed_attempts[key] = [ts for ts in self.failed_attempts[key] if now - ts < self.window_seconds]
        self.failed_attempts[key].append(now)

        if len(self.failed_attempts[key]) >= self.max_failures:
            self.lockouts[key] = now + self.lockout_seconds

    def record_success(self, client_ip: str, path: str):
        key = (client_ip, path)
        if key in self.failed_attempts:
            del self.failed_attempts[key]
        if key in self.lockouts:
            del self.lockouts[key]

    def inspect(self, client_ip: str, path: str) -> Tuple[bool, str, Dict[str, Any]]:
        now = time.time()
        key = (client_ip, path)

        if key in self.lockouts:
            if now < self.lockouts[key]:
                remaining = int(self.lockouts[key] - now)
                return True, f"Account login temporarily locked due to repeated failures (remaining {remaining}s)", {"locked": True}
            else:
                del self.lockouts[key]

        return False, "", {}

brute_force_module = BruteForceDefenseModule()
