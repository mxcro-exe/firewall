import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

GRAPHQL_INTROSPECTION = re.compile(
    r"(\b__schema\b|\b__type\b|\b__typename\b\s*\{|\bIntrospectionQuery\b)",
    re.IGNORECASE
)

class GraphQLDefenseModule:
    """
    GraphQL Abuse & Introspection Defense Module.
    Blocks GraphQL schema scraping and malicious recursive query depth bombing attacks.
    """
    def inspect(self, payload: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not payload or not any(k in payload.lower() for k in ["graphql", "__schema", "__type", "{"]):
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(payload)
        
        # 1. Schema Introspection detection
        match = GRAPHQL_INTROSPECTION.search(norm_text)
        if match:
            return True, f"GraphQL Introspection schema probe blocked: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        # 2. Query depth bombing check (> 8 nested braces)
        max_depth = 0
        current_depth = 0
        for char in norm_text:
            if char == '{':
                current_depth += 1
                if current_depth > max_depth:
                    max_depth = current_depth
            elif char == '}':
                current_depth = max(0, current_depth - 1)

        if max_depth > 8:
            return True, f"GraphQL recursive query depth bombing detected (depth: {max_depth} > 8)", {
                "detected_depth": max_depth
            }

        return False, "", {}

graphql_module = GraphQLDefenseModule()

