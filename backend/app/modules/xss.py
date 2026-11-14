import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

XSS_TAGS_REGEX = re.compile(
    r"<(script|iframe|img|svg|body|style|link|meta|embed|object|input|video|audio|form|a)\b",
    re.IGNORECASE
)

XSS_HANDLERS_REGEX = re.compile(
    r"(on\w+\s*=|javascript\s*:|vbscript\s*:|eval\s*\(|alert\s*\(|confirm\s*\(|"
    r"prompt\s*\(|document\.cookie|document\.domain|window\.location)",
    re.IGNORECASE
)

class XSSDefenseModule:
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        tag_match = XSS_TAGS_REGEX.search(norm_text)
        handler_match = XSS_HANDLERS_REGEX.search(norm_text)

        if tag_match or handler_match:
            detected = []
            if tag_match: detected.append(tag_match.group(0))
            if handler_match: detected.append(handler_match.group(0))

            return True, f"Cross-Site Scripting (XSS) detected: {', '.join(detected)}", {
                "matched_patterns": detected,
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

xss_module = XSSDefenseModule()

