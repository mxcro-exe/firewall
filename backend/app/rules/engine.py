import re
import urllib.parse
import json
from typing import List, Optional, Tuple, Dict, Any
from app.rules.normalizer import normalize_string
from app.rules.redos_guard import ReDoSStaticAnalyzer, safe_regex_matcher
from app.models.rule import VirtualPatchRule

class VirtualPatchEngine:
    def __init__(self):
        self._compiled_cache: Dict[str, re.Pattern] = {}

    def get_compiled_pattern(self, pattern_str: str) -> Optional[re.Pattern]:
        if pattern_str not in self._compiled_cache:
            # 1. Static ReDoS AST safety check
            is_safe, err = ReDoSStaticAnalyzer.analyze_ast(pattern_str)
            if not is_safe:
                # Unsafe pattern rejected to prevent CPU starvation
                return None
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
        Evaluate incoming request against active scoped virtual patch rules with ReDoS safeguards.
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
            if not (clean_path == rule_path or clean_path.startswith(rule_path.rstrip('/') + '/')):
                continue

            # 3. Extract Target Value to inspect
            target_value = ""
            if rule.target_param:
                if rule.target_param in query_params:
                    target_value = " ".join(query_params[rule.target_param])
                elif body_text:
                    try:
                        body_json = json.loads(body_text)
                        if isinstance(body_json, dict) and rule.target_param in body_json:
                            target_value = str(body_json[rule.target_param])
                    except Exception:
                        form_params = urllib.parse.parse_qs(body_text, keep_blank_values=True)
                        if rule.target_param in form_params:
                            target_value = " ".join(form_params[rule.target_param])
            else:
                target_value = f"{query_string} {body_text}"

            if not target_value:
                continue

            # 4. Normalize & Unpack Evasions
            normalized_value, obfuscated, techniques = normalize_string(target_value)

            # 5. Pattern Match with ReDoS Timeout Guard (50ms limit)
            pattern = self.get_compiled_pattern(rule.pattern_value)
            if not pattern:
                continue

            is_matched, match, elapsed_ms = safe_regex_matcher.match_with_timeout(pattern, normalized_value)
            if is_matched and match:
                return rule, {
                    "matched_text": match.group(0),
                    "target_param": rule.target_param or "ALL",
                    "obfuscation_detected": obfuscated,
                    "evasion_techniques": techniques,
                    "rule_version": rule.version,
                    "scan_latency_ms": round(elapsed_ms, 3)
                }

        return None, None

rule_engine = VirtualPatchEngine()

