import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

DESERIAL_REGEX = re.compile(
    r"(O:\d+:\"[a-zA-Z0-9_\\]+\":\d+:\{|"
    r"cos\s*[\r\n]+system|"
    r"cposix\s*[\r\n]+system|"
    r"rO0AB[A-Za-z0-9+/=]{4,}|"
    r"\\xac\\xed\\x00\\x05|"
    r"\$type:\s*[\"']System\.Diagnostics\.Process|"
    r"\$type:\s*[\"']System\.Windows\.Data\.ObjectDataProvider|"
    r"__reduce__|__reduce_ex__|__setstate__|"
    r"java\.lang\.Runtime\.getRuntime\(\)\.exec|"
    r"org\.apache\.commons\.collections\.functors|org\.springframework\.core\.serializer)",
    re.IGNORECASE
)

class InsecureDeserializationDefenseModule:
    """
    Insecure Deserialization Defense Module.
    Blocks remote code execution payloads in Python pickle, PHP Object Injection, Java gadgets, and .NET formatters.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        match = DESERIAL_REGEX.search(norm_text)
        if match:
            return True, f"Insecure Deserialization payload detected: {match.group(0)[:50]}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

deserial_module = InsecureDeserializationDefenseModule()

