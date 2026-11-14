import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

PRIVILEGE_TAMPER_REGEX = re.compile(
    r"\b(?:is_admin|isAdmin|is_superuser|isSuperuser|is_staff|role|user_role|userRole|account_type|group)\s*[:=]\s*(?:[\"']?(?:admin|administrator|root|superuser|true|1)[\"']?)",
    re.IGNORECASE
)

class MassAssignmentDefenseModule:
    """
    Mass Assignment & HTTP Parameter Pollution (HPP) Defense Module.
    Blocks parameter tampering attempts aimed at privilege escalation and administrative field poisoning.
    """
    def inspect(self, query_string: str, body_text: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        full_payload = f"{query_string} {body_text}".strip()
        if not full_payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(full_payload)
        
        # 1. Check for unauthorized administrative escalation fields
        match = PRIVILEGE_TAMPER_REGEX.search(norm_text)
        if match:
            # Check if this is an explicit tampering payload
            return True, f"Mass Assignment privilege escalation attempt blocked: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        # 2. Check for HTTP Parameter Pollution (duplicate sensitive keys)
        if query_string:
            params = [p.split('=')[0].lower() for p in query_string.split('&') if '=' in p]
            sensitive_keys = {"role", "admin", "user_id", "email", "amount", "price"}
            for p in params:
                if p in sensitive_keys and params.count(p) > 1:
                    return True, f"HTTP Parameter Pollution (HPP) probe detected on key: {p}", {
                        "polluted_param": p,
                        "occurrences": params.count(p)
                    }

        return False, "", {}

mass_assign_module = MassAssignmentDefenseModule()
