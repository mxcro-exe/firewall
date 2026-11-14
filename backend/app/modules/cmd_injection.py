import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

CMD_REGEX = re.compile(
    r"(;\s*(cat|ls|pwd|whoami|id|uname|netcat|nc|curl|wget|bash|sh|powershell|cmd)\b|"
    r"\|\s*(cat|ls|pwd|whoami|id|uname|netcat|nc|curl|wget|bash|sh)\b|"
    r"`(cat|ls|pwd|whoami|id|uname|curl|wget)`|\$\(cat|\$\(whoami|\bexec\s*\(|\bsystem\s*\()",
    re.IGNORECASE
)

class CommandInjectionDefenseModule:
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = CMD_REGEX.search(norm_text)
        if match:
            return True, f"OS Command Injection pattern detected: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

cmd_module = CommandInjectionDefenseModule()

