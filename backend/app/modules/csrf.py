import re
from typing import Tuple, Dict, Any

SUSPICIOUS_ORIGINS = re.compile(
    r"(evil\.com|attacker|hacker|malicious|phishing|null|file://|localhost\.evil)",
    re.IGNORECASE
)

class CSRFDefenseModule:
    """
    CSRF & Origin Spoofing Defense Module.
    Blocks cross-site request forgery and origin header spoofing on state-changing HTTP methods.
    """
    def inspect(self, method: str, path: str, origin: str = "", referer: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        if method.upper() not in ["POST", "PUT", "DELETE", "PATCH"]:
            return False, "", {}

        check_str = f"{origin} {referer}".strip()
        if not check_str:
            return False, "", {}

        match = SUSPICIOUS_ORIGINS.search(check_str)
        if match:
            return True, f"CSRF Origin Spoofing detected: untrusted external source ({match.group(0)})", {
                "matched_origin": match.group(0),
                "origin_header": origin,
                "referer_header": referer
            }

        return False, "", {}

csrf_module = CSRFDefenseModule()
