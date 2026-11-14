import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

REDIRECT_PARAMS = re.compile(
    r"\b(?:redirect|redirect_to|redirect_url|return|return_to|return_url|next|url|target|dest|destination|goto|forward|link|out|view)\s*=",
    re.IGNORECASE
)

SUSPICIOUS_TARGET = re.compile(
    r"(?:=\s*(?:\/\/|\\\\|[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+|javascript:|data:|vbscript:|"
    r"https?:\/\/(?!localhost|127\.0\.0\.1)[^\s&\/]+))",
    re.IGNORECASE
)

class OpenRedirectDefenseModule:
    """
    Open URL Redirection Defense Module.
    Blocks phishing attempts abusing unvalidated redirect parameters to forward users to malicious phishing portals.
    """
    def inspect(self, query_string: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not query_string or "=" not in query_string:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(query_string)
        if REDIRECT_PARAMS.search(norm_text) and SUSPICIOUS_TARGET.search(norm_text):
            match = SUSPICIOUS_TARGET.search(norm_text)
            return True, f"Open URL Redirection (Phishing) probe blocked: {match.group(0)[:60]}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

redirect_module = OpenRedirectDefenseModule()

