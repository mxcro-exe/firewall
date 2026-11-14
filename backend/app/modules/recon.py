import re
from typing import Tuple, Dict, Any
from app.rules.normalizer import normalize_string

RECON_PATHS_REGEX = re.compile(
    r"(/\.env|\.environment|\.git/|\.svn/|\.hg/|wp-config\.php|configuration\.php|"
    r"config\.inc\.php|\.aws/credentials|\.docker/config\.json|"
    r"/backup\.sql|/dump\.sql|/database\.sql|/db\.sql|"
    r"/phpmyadmin|/pma|/adminer\.php|/actuator/health|/actuator/env|"
    r"/solr/admin|/vendor/phpunit|/\.DS_Store|/server-status|"
    r"/web\.config|/WEB-INF/web\.xml)",
    re.IGNORECASE
)

class SensitiveReconDefenseModule:
    """
    Sensitive File & Honeytrap Reconnaissance Defense Module.
    Blocks automated attacks probing secret configurations, backups, environment keys, and git repositories.
    """
    def inspect(self, path: str, payload: str = "") -> Tuple[bool, str, Dict[str, Any]]:
        target = f"{path} {payload}".strip()
        if not target:
            return False, "", {}

        norm_text, obfuscated, techniques = normalize_string(target)
        match = RECON_PATHS_REGEX.search(norm_text)
        if match:
            return True, f"Sensitive reconnaissance probe blocked: {match.group(0)}", {
                "matched_pattern": match.group(0),
                "obfuscation_detected": obfuscated,
                "techniques": techniques
            }

        return False, "", {}

recon_module = SensitiveReconDefenseModule()
