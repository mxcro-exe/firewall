from typing import Tuple

HONEYPOT_TRAP_PATHS = {
    "/wp-login.php",
    "/wp-admin",
    "/.env",
    "/.git/config",
    "/admin.php",
    "/phpmyadmin",
    "/actuator/health",
    "/actuator/env",
    "/solr/admin",
    "/shell.php"
}

def is_honeypot_path(path: str) -> Tuple[bool, str]:
    clean = f"/{path.lstrip('/')}".lower()
    for trap in HONEYPOT_TRAP_PATHS:
        if clean == trap or clean.startswith(trap):
            return True, f"Attacker accessed honeypot deception trap: {trap}"
    return False, ""

