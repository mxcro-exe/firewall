import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

SSTI_REGEX = re.compile(
    r"(\{\{\s*(?:[0-9]+\s*[\*\+\-\/]\s*[0-9]+|config|self|request|session|g|application|"
    r"lipsum|cycler|joiner|namespace|__class__|__mro__|__subclasses__|__globals__|"
    r"__builtins__|subprocess|popen|open|read|write)\s*\}\}|"
    r"\$\{\s*(?:[0-9]+\s*[\*\+\-\/]\s*[0-9]+|T\(|java\.lang|Runtime|ProcessBuilder)\s*\}|"
    r"<%=?\s*(?:[0-9]+\s*[\*\+\-\/]\s*[0-9]+|system|exec|IO\.read)\s*%>|"
    r"\{\%\s*(?:import|include|set|extends)\s+.*(?:os|subprocess|sys|sh).*\%\}|"
    r"#\{\s*[0-9]+\s*[\*\+\-\/]\s*[0-9]+\s*\})",
    re.IGNORECASE
)

class SSTIDefenseModule:
    """
    Server-Side Template Injection (SSTI) Defense Module.
    Blocks remote code execution payloads targeting Jinja2, Twig, Freemarker, Velocity, Smarty, and ERB engines.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = SSTI_REGEX.search(norm_text)
        if match:
            return True, f"Server-Side Template Injection (SSTI) detected: {match.group(0)[:60]}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

ssti_module = SSTIDefenseModule()
