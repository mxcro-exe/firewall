import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

CRLF_REGEX = re.compile(
    r"(%0d%0a|%0a%0d|%0d|%0a|\\r\\n|\\n\\r)[\s\t]*(?:Set-Cookie|Location|Content-Length|Transfer-Encoding|X-Forwarded|Host):",
    re.IGNORECASE
)

SMUGGLING_REGEX = re.compile(
    r"(transfer-encoding\s*:\s*chunked.*transfer-encoding|"
    r"content-length\s*:\s*\d+.*content-length\s*:\s*\d+|"
    r"transfer-encoding\s*:\s*.*identity)",
    re.IGNORECASE
)

class RequestSmugglingDefenseModule:
    """
    HTTP Request Smuggling & CRLF Header Split Defense Module.
    Blocks HTTP desynchronization attacks and carriage-return/line-feed (CRLF) header injections.
    """
    def inspect(self, headers_str: str, payload: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        target = f"{headers_str} {payload}".strip()
        if not target:
            return False, "", {}

        # 1. Check CRLF injection in parameters or headers
        crlf_match = CRLF_REGEX.search(target)
        if crlf_match:
            return True, f"CRLF Header Injection attempt detected: {crlf_match.group(0)[:40]}", {
                "matched_pattern": crlf_match.group(0)
            }

        # 2. Check Request Smuggling conflict
        smuggle_match = SMUGGLING_REGEX.search(target)
        if smuggle_match:
            return True, "HTTP Request Smuggling desync attempt blocked", {
                "matched_pattern": smuggle_match.group(0)
            }

        return False, "", {}

smuggling_module = RequestSmugglingDefenseModule()

