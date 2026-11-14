import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

ILLEGAL_METHODS = {"TRACE", "TRACK", "DEBUG", "PROPFIND", "PROPPATCH", "MKCOL", "MOVE"}

class ProtocolAbuseDefenseModule:
    """
    Protocol & WebSocket Abuse Defense Module.
    Blocks forbidden HTTP methods, null-byte bypasses, and protocol tampering attacks.
    """
    def inspect(self, method: str, path: str, headers_str: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        # 1. Illegal / diagnostic HTTP method check
        if method.upper() in ILLEGAL_METHODS:
            return True, f"Dangerous/Prohibited HTTP Method blocked: {method.upper()}", {
                "prohibited_method": method.upper()
            }

        # 2. Null-byte injection check in path or headers
        target = f"{path} {headers_str}"
        if "%00" in target or "\x00" in target or "\\0" in target:
            return True, "Null-byte (%00) protocol bypass attempt terminated", {
                "detected_pattern": "%00"
            }

        # 3. Malformed WebSocket upgrade check
        if "upgrade: websocket" in headers_str.lower():
            if "sec-websocket-key" not in headers_str.lower() and "sec-websocket-version" not in headers_str.lower():
                return True, "Malformed WebSocket upgrade handshake probe blocked", {
                    "violation": "missing_required_handshake_headers"
                }

        return False, "", {}

proto_abuse_module = ProtocolAbuseDefenseModule()

