import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

TRAVERSAL_REGEX = re.compile(
    r"(\.\./|\.\.\\|%2e%2e%2f|%2e%2e/|\.\.%2f|%2e%2e%5c|/etc/passwd|/windows/win\.ini|"
    r"boot\.ini|win\.ini|windows\\system32|proc/self/environ|WEB-INF/web\.xml)",
    re.IGNORECASE
)

class PathTraversalDefenseModule:
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = TRAVERSAL_REGEX.search(norm_text)
        if match:
            return True, f"Path Traversal attempt: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

path_module = PathTraversalDefenseModule()

