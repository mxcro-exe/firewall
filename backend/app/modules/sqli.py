import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

SQL_KEYWORDS_REGEX = re.compile(
    r"\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TABLE|DATABASE|"
    r"EXEC|EXECUTE|DECLARE|CAST|CONVERT|BENCHMARK|SLEEP|WAITFOR|DELAY|"
    r"INFORMATION_SCHEMA|SCHEMA|GROUP_CONCAT|HEX|CHAR|LOAD_FILE|OUTFILE)\b",
    re.IGNORECASE
)

SQL_OPERATORS_REGEX = re.compile(
    r"(--|/\*|\*/|#|@@|\|\||&&|'1'='1'|\"1\"=\"1\"|'or'|'and'|1=1|1=0|\bOR\s+\d+=\d+|\bAND\s+\d+=\d+)",
    re.IGNORECASE
)

class SQLiDefenseModule:
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        kw_match = SQL_KEYWORDS_REGEX.search(norm_text)
        op_match = SQL_OPERATORS_REGEX.search(norm_text)

        if kw_match or op_match:
            matched_items = []
            if kw_match: matched_items.append(kw_match.group(0))
            if op_match: matched_items.append(op_match.group(0))

            return True, f"SQL Injection detected: {', '.join(matched_items)}", {
                "matched_patterns": matched_items,
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

sqli_module = SQLiDefenseModule()

