from typing import Tuple, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.module_config import AttackModuleSetting

# 20 Attack Defense Modules
from app.modules.ddos import ddos_module
from app.modules.sqli import sqli_module
from app.modules.xss import xss_module
from app.modules.path_traversal import path_module
from app.modules.cmd_injection import cmd_module
from app.modules.brute_force import brute_force_module
from app.modules.bot_scraper import bot_module
from app.modules.ssrf import ssrf_module
from app.modules.recon import recon_module
from app.modules.xxe import xxe_module
from app.modules.ssti import ssti_module
from app.modules.deserial import deserial_module
from app.modules.redirect import redirect_module
from app.modules.csrf import csrf_module
from app.modules.nosql import nosql_module
from app.modules.smuggling import smuggling_module
from app.modules.ldap import ldap_module
from app.modules.graphql import graphql_module
from app.modules.mass_assign import mass_assign_module
from app.modules.proto_abuse import proto_abuse_module

class AttackDefenseManager:
    """
    Coordinates and executes all 20 Attack-Specific Defense Modules in priority sequence.
    Sub-1.5ms evaluation pipeline with early-exit short-circuiting on threat detection.
    """
    async def inspect_request(
        self,
        client_ip: str,
        method: str,
        path: str,
        query_string: str,
        body_text: str,
        user_agent: str,
        db: AsyncSession,
        headers: Optional[Dict[str, str]] = None
    ) -> Tuple[bool, Optional[str], Optional[str], Dict[str, Any]]:
        """
        Inspect request through all 20 enabled attack defense modules.
        Returns: (blocked, module_key, reason, details)
        """
        headers = headers or {}
        headers_str = " ".join([f"{k}: {v}" for k, v in headers.items()])

        # Fetch enabled settings
        res = await db.execute(select(AttackModuleSetting))
        settings_list = res.scalars().all()
        active_map = {s.module_key: s.is_enabled for s in settings_list}

        full_payload = f"{query_string} {body_text}".strip()

        # 1. Protocol Abuse & Illegal Verbs
        if active_map.get("proto_abuse", True):
            blocked, reason, details = proto_abuse_module.inspect(method, path, headers_str)
            if blocked:
                await self._increment_blocked(db, "proto_abuse")
                return True, "proto_abuse", reason, details

        # 2. HTTP Request Smuggling & CRLF Header Split
        if active_map.get("smuggling", True):
            blocked, reason, details = smuggling_module.inspect(headers_str, full_payload)
            if blocked:
                await self._increment_blocked(db, "smuggling")
                return True, "smuggling", reason, details

        # 3. DDoS & HTTP Rate Limiting
        if active_map.get("ddos", True):
            blocked, reason, details = ddos_module.inspect(client_ip)
            if blocked:
                await self._increment_blocked(db, "ddos")
                return True, "ddos", reason, details

        # 4. Bot & Malicious Scraper Drop
        if active_map.get("bot", True):
            blocked, reason, details = bot_module.inspect(user_agent, path)
            if blocked:
                await self._increment_blocked(db, "bot")
                return True, "bot", reason, details

        # 5. Sensitive Reconnaissance Probe
        if active_map.get("recon", True):
            blocked, reason, details = recon_module.inspect(path, full_payload)
            if blocked:
                await self._increment_blocked(db, "recon")
                return True, "recon", reason, details

        # 6. Brute Force Login Protection
        if active_map.get("brute", True) and any(k in path.lower() for k in ["login", "auth", "signin", "admin"]):
            blocked, reason, details = brute_force_module.inspect(client_ip, path)
            if blocked:
                await self._increment_blocked(db, "brute")
                return True, "brute", reason, details

        # 7. CSRF & Origin Spoofing
        if active_map.get("csrf", True) and method.upper() in ["POST", "PUT", "DELETE", "PATCH"]:
            origin = headers.get("origin", "")
            referer = headers.get("referer", "")
            blocked, reason, details = csrf_module.inspect(method, path, origin, referer)
            if blocked:
                await self._increment_blocked(db, "csrf")
                return True, "csrf", reason, details

        # 8. Path Traversal & LFI Guard
        if active_map.get("path", True):
            check_str = f"{path} {full_payload}"
            blocked, reason, details = path_module.inspect(check_str)
            if blocked:
                await self._increment_blocked(db, "path")
                return True, "path", reason, details

        # 9. SQL Injection Guard
        if active_map.get("sqli", True) and full_payload:
            blocked, reason, details = sqli_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "sqli")
                return True, "sqli", reason, details

        # 10. Cross-Site Scripting (XSS) Filter
        if active_map.get("xss", True) and full_payload:
            blocked, reason, details = xss_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "xss")
                return True, "xss", reason, details

        # 11. OS Command Injection
        if active_map.get("cmd", True) and full_payload:
            blocked, reason, details = cmd_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "cmd")
                return True, "cmd", reason, details

        # 12. Server-Side Template Injection (SSTI)
        if active_map.get("ssti", True) and full_payload:
            blocked, reason, details = ssti_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "ssti")
                return True, "ssti", reason, details

        # 13. NoSQL Injection
        if active_map.get("nosql", True) and full_payload:
            blocked, reason, details = nosql_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "nosql")
                return True, "nosql", reason, details

        # 14. XML External Entity (XXE) Injection
        if active_map.get("xxe", True) and body_text:
            blocked, reason, details = xxe_module.inspect(body_text)
            if blocked:
                await self._increment_blocked(db, "xxe")
                return True, "xxe", reason, details

        # 15. Server-Side Request Forgery (SSRF)
        if active_map.get("ssrf", True) and full_payload:
            blocked, reason, details = ssrf_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "ssrf")
                return True, "ssrf", reason, details

        # 16. Insecure Deserialization
        if active_map.get("deserial", True) and full_payload:
            blocked, reason, details = deserial_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "deserial")
                return True, "deserial", reason, details

        # 17. Open URL Redirection
        if active_map.get("redirect", True) and query_string:
            blocked, reason, details = redirect_module.inspect(query_string)
            if blocked:
                await self._increment_blocked(db, "redirect")
                return True, "redirect", reason, details

        # 18. LDAP Injection
        if active_map.get("ldap", True) and full_payload:
            blocked, reason, details = ldap_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "ldap")
                return True, "ldap", reason, details

        # 19. GraphQL Abuse & Schema Introspection
        if active_map.get("graphql", True) and full_payload:
            blocked, reason, details = graphql_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "graphql")
                return True, "graphql", reason, details

        # 20. Parameter Pollution & Mass Assignment
        if active_map.get("mass_assign", True) and full_payload:
            blocked, reason, details = mass_assign_module.inspect(query_string, body_text)
            if blocked:
                await self._increment_blocked(db, "mass_assign")
                return True, "mass_assign", reason, details

        return False, None, None, {}

    async def _increment_blocked(self, db: AsyncSession, module_key: str):
        res = await db.execute(select(AttackModuleSetting).where(AttackModuleSetting.module_key == module_key))
        setting = res.scalars().first()
        if setting:
            setting.blocked_count_24h += 1
            await db.commit()

defense_manager = AttackDefenseManager()
