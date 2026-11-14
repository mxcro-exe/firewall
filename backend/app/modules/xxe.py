import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

XXE_REGEX = re.compile(
    r"(<!ENTITY\s+[\w\.-]+\s+(?:SYSTEM|PUBLIC)\s+[\"'][^\"']*[\"']|"
    r"<!DOCTYPE\s+[\w\.-]+\s*\[[^\]]*<!ENTITY|"
    r"SYSTEM\s+[\"'](?:file|http|https|ftp|expect|php|data)://|"
    r"xmlns:xi=[\"']http://www\.w3\.org/2001/XInclude[\"']|"
    r"<xi:include\s+href=)",
    re.IGNORECASE
)

class XXEDefenseModule:
    """
    XML External Entity (XXE) Injection Defense Module.
    Blocks attempts to extract local server files, cause SSRF, or trigger XML entity bombs.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = XXE_REGEX.search(norm_text)
        if match:
            return True, f"XML External Entity (XXE) injection detected: {match.group(0)[:60]}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

xxe_module = XXEDefenseModule()
