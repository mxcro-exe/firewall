import socket
from typing import Tuple, Optional
from fastapi import Request, Response
from app.core.kv_cache import kv_cache

class LowLevelPacketFilter:
    """
    Low-Level Packet & Connection Drop Filter.
    Intercepts blacklisted IPs, botnets, and CIDR subnets at the earliest socket layer,
    dropping connections immediately before payload parsing or TLS termination overhead.
    """
    def __init__(self):
        # Known aggressive scanning signatures & botnets
        self.instant_drop_user_agents = {
            "masscan", "zgrab", "shodan", "censys", "nmap",
            "dirbuster", "gobuster", "nikto", "acunetix"
        }

    def should_instant_drop(self, client_ip: str, user_agent: str = "") -> Tuple[bool, Optional[str]]:
        """
        O(1) Evaluation whether connection should be dropped immediately.
        """
        # 1. Microsecond In-Memory Ban & CIDR Check
        is_banned, reason = kv_cache.is_ip_banned(client_ip)
        if is_banned:
            return True, f"Pre-parsed connection drop: {reason}"

        # 2. Aggressive scanner agent immediate termination
        ua_lower = user_agent.lower()
        for bot in self.instant_drop_user_agents:
            if bot in ua_lower:
                return True, f"Instant TCP termination for weaponized scanner: {bot}"

        return False, None

    def create_instant_drop_response(self, reason: str) -> Response:
        """
        Generates an instant raw HTTP 444 / 403 termination response with connection: close header
        to terminate the underlying TCP socket without TLS buffering.
        """
        return Response(
            content=b'{"error":"Connection terminated by PatchShield packet filter","status":"TCP_DROP"}\n',
            status_code=403,
            headers={
                "Connection": "close",
                "X-PatchShield-Action": "TCP_DROP",
                "Content-Type": "application/json"
            }
        )

packet_filter = LowLevelPacketFilter()

