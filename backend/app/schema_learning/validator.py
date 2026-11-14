import json
from typing import Dict, Any, List, Tuple

class APISchemaValidator:
    def __init__(self):
        # path -> allowed query parameters set
        self.learned_schemas: Dict[str, set] = {
            "/api/products": {"q", "page", "limit", "sort", "category"},
            "/api/orders": {"order_id", "status", "customer_id"},
            "/api/auth/login": {"username", "password", "totp_code"},
        }

    def import_openapi_json(self, openapi_dict: dict) -> int:
        """Extract allowed parameters from OpenAPI 3.0 spec"""
        count = 0
        paths = openapi_dict.get("paths", {})
        for path_key, methods in paths.items():
            allowed_params = set()
            for method, spec in methods.items():
                if isinstance(spec, dict) and "parameters" in spec:
                    for p in spec["parameters"]:
                        if isinstance(p, dict) and "name" in p:
                            allowed_params.add(p["name"])
            if allowed_params:
                self.learned_schemas[path_key] = allowed_params
                count += 1
        return count

    def validate_request(self, path: str, query_params: Dict[str, Any]) -> Tuple[bool, str]:
        """Check for unexpected parameter pollution or schema deviation"""
        clean_path = f"/{path.lstrip('/')}"
        if clean_path in self.learned_schemas:
            allowed = self.learned_schemas[clean_path]
            for param in query_params:
                if param not in allowed:
                    return True, f"API Schema Deviation: Unexpected parameter '{param}' observed on endpoint {clean_path}."
        return False, ""

schema_validator = APISchemaValidator()

