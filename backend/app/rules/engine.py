import re
import urllib.parse
import json
from typing import List, Optional, Tuple, Dict, Any
from app.rules.normalizer import normalize_string
from app.models.rule import VirtualPatchRule

class VirtualPatchEngine:
    def __init__(self):
        self._compiled_cache: Dict[str, re.Pattern] = {}

    def get_compiled_pattern(self, pattern_str: str) -> Optional[re.Pattern]:
        if pattern_str not in self._compiled_cache:
            try:
                self._compiled_cache[pattern_str] = re.compile(pattern_str, re.IGNORECASE)
            except re.error:
                return None
        return self._compiled_cache[pattern_str]

    def evaluate(
        self,
        method: str,
        path: str,
        query_string: str,
        body_text: str,
        rules: List[VirtualPatchRule]
    ) -> Tuple[Optional[VirtualPatchRule], Optional[Dict[str, Any]]]:
        """
        Evaluate incoming request against active scoped virtual patch rules.
        Returns: (matched_rule, match_context) or (None, None)
        """
        clean_path = f"/{path.lstrip('/')}"
        query_params = urllib.parse.parse_qs(query_string, keep_blank_values=True)

        for rule in rules:
            if not rule.is_active or rule.status == "RETIRED":
                continue

            # 1. Match HTTP Method
            if rule.http_method and rule.http_method.upper() != "ANY":
                if rule.http_method.upper() != method.upper():
                    continue

            # 2. Match Endpoint Path (Prefix or Exact match)
            rule_path = f"/{rule.endpoint_path.lstrip('/')}"
            # Check prefix or equality
            if not (clean_path == rule_path or clean_path.startswith(rule_path.rstrip('/') + '/')):
                continue

            # 3. Extract Target Value to inspect
            target_value = ""
            if rule.target_param:
                # Look in query params
                if rule.target_param in query_params:
                    target_value = " ".join(query_params[rule.target_param])
                # Look in body (JSON or form-encoded)
                elif body_text:
                    try:
                        # Attempt JSON parse
                        body_json = json.loads(body_text)
                        if isinstance(body_json, dict) and rule.target_param in body_json:
                            target_value = str(body_json[rule.target_param])
                    except Exception:
                        # Fallback to URL-encoded form parse
                        form_params = urllib.parse.parse_qs(body_text, keep_blank_values=True)
                        if rule.target_param in form_params:
                            target_value = " ".join(form_params[rule.target_param])
            else:
                # If no specific param is scoped, inspect query string + body text
                target_value = f"{query_string} {body_text}"

            if not target_value:
                continue

            # 4. Normalize & Unpack Evasions
            normalized_value, obfuscated, techniques = normalize_string(target_value)

            # 5. Pattern Match
            pattern = self.get_compiled_pattern(rule.pattern_value)
            if not pattern:
                continue

            match = pattern.search(normalized_value)
            if match:
                return rule, {
                    "matched_text": match.group(0),
                    "target_param": rule.target_param or "ALL",
                    "obfuscation_detected": obfuscated,
                    "evasion_techniques": techniques,
                    "rule_version": rule.version
                }

        return None, None

rule_engine = VirtualPatchEngine()
