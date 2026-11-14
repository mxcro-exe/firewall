import re
from typing import Tuple, Dict, Any

BAD_USER_AGENTS = re.compile(
    r"(sqlmap|nikto|w3af|acunetix|nessus|nmap|masscan|zgrab|"
    r"gobuster|dirbuster|dirb|hydra|burpcollaborator|python-requests|"
    r"scrapy|censys|shodan|project-discovery|nuclei)",
    re.IGNORECASE
)

class BotScraperDefenseModule:
    def inspect(self, user_agent: str, path: str) -> Tuple[bool, str, Dict[str, Any]]:
        if not user_agent:
            return True, "Blocked: Missing User-Agent header (automated bot fingerprint)", {"bot": True}

        match = BAD_USER_AGENTS.search(user_agent)
        if match:
            return True, f"Malicious scanner/scraper bot blocked: {match.group(0)}", {
                "detected_bot": match.group(0),
                "user_agent": user_agent
            }

        return False, "", {}

bot_module = BotScraperDefenseModule()

