import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

SSRF_REGEX = re.compile(
    r"(169\.254\.169\.254|metadata\.google\.internal|100\.100\.100\.200|"
    r"127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\]|127\.\d+\.\d+\.\d+|"
    r"2130706433|0177\.0\.0\.1|0x7f\.0\.0\.1|"
    r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
    r"172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}|"
    r"192\.168\.\d{1,3}\.\d{1,3})",
    re.IGNORECASE
)

SSRF_PARAM_REGEX = re.compile(
    r"(\b(?:url|uri|target|dest|destination|redirect|endpoint|webhook|feed|fetch|src|proxy)\s*=\s*(?:https?|ftp|gopher|file|dict|ldap)://[^\s&]+)",
    re.IGNORECASE
)

class SSRFDefenseModule:
    """
    Server-Side Request Forgery (SSRF) Defense Module.
    Blocks attempts to probe internal cloud metadata, loopback interfaces, and private subnet IP ranges.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        
        # Check for direct metadata or loopback IP probe
        ip_match = SSRF_REGEX.search(norm_text)
        if ip_match:
            # If it's preceded by url= or http:// or standalone suspicious IP probe
            if "://" in norm_text or any(p in norm_text.lower() for p in ["url=", "uri=", "target=", "dest=", "fetch=", "proxy="]):
                return True, f"SSRF attempt: unauthorized internal address probe ({ip_match.group(0)})", {
                    "matched_pattern": ip_match.group(0),
                    "obfuscation_detected": obfuscated,
                    "techniques": techniques
                }
            if ip_match.group(0) in ["169.254.169.254", "metadata.google.internal"]:
                return True, f"SSRF cloud metadata theft blocked: {ip_match.group(0)}", {
                    "matched_pattern": ip_match.group(0),
                    "obfuscation_detected": obfuscated,
                    "techniques": techniques
                }

        # Check for dangerous protocols (gopher://, file://, dict://)
        proto_match = re.search(r"\b(gopher|file|dict|ldap)://", norm_text, re.IGNORECASE)
        if proto_match:
            return True, f"SSRF dangerous protocol probe: {proto_match.group(0)}", {
                "matched_pattern": proto_match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

ssrf_module = SSRFDefenseModule()

