from typing import Tuple, Set

# Offline GeoIP IP prefixes for high-threat origin ranges
OFFLINE_BLOCKED_SUBNETS = [
    "185.220.",   # Known Tor exit nodes / scanner proxies
    "194.26.",    # Bulletproof hosting ranges
    "45.154.",
    "193.142."
]

class OfflineGeoIPFilter:
    def __init__(self):
        self.blocked_countries: Set[str] = set()  # Can be populated from settings

    def is_blocked_ip(self, client_ip: str) -> Tuple[bool, str]:
        # Always permit localhost / private addresses
        if client_ip in ["127.0.0.1", "localhost", "::1"] or client_ip.startswith("192.168.") or client_ip.startswith("10."):
            return False, ""

        for prefix in OFFLINE_BLOCKED_SUBNETS:
            if client_ip.startswith(prefix):
                return True, f"Connection blocked: Client IP {client_ip} matches offline blacklisted bulletproof subnet."

        return False, ""

geoip_filter = OfflineGeoIPFilter()
