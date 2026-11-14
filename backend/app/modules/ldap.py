import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

LDAP_REGEX = re.compile(
    r"(\(\s*[&|!]\s*\([a-zA-Z0-9_-]+=[^\)]*\)\s*\([a-zA-Z0-9_-]+=[^\)]*\)\s*\)|"
    r"\)\s*\(\s*\||\)\s*\(\s*&|\*\s*\)\s*\([a-zA-Z0-9_-]+=|"
    r"\([a-zA-Z0-9_-]+=\*\)|\(userPassword=\*\)|"
    r"\(mail=\*\)|\(sAMAccountName=\*\)|"
    r"\x00|\%00|\0)",
    re.IGNORECASE
)

class LDAPDefenseModule:
    """
    LDAP Injection Defense Module.
    Blocks directory query manipulation and wildcard authentication bypasses against enterprise LDAP directories.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = LDAP_REGEX.search(norm_text)
        if match:
            return True, f"LDAP Injection attempt detected: {match.group(0)[:50]}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

ldap_module = LDAPDefenseModule()
