import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

NOSQL_REGEX = re.compile(
    r"(\[\s*\$(?:gt|gte|lt|lte|ne|eq|in|nin|regex|where|exists|or|and|nor|all|mod)\s*\]|"
    r"[\"']\$(?:gt|gte|lt|lte|ne|eq|in|nin|regex|where|exists|or|and|nor|all|mod)[\"']\s*:|"
    r"\$(?:where|regex)\s*[:=]|"
    r"tojson\(\)|db\.getCollection|sleep\(\d+\))",
    re.IGNORECASE
)

class NoSQLDefenseModule:
    """
    NoSQL Injection Defense Module.
    Blocks MongoDB and CouchDB operator injection in URL query parameters and JSON request bodies.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = NOSQL_REGEX.search(norm_text)
        if match:
            return True, f"NoSQL Injection attempt detected: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

nosql_module = NoSQLDefenseModule()
