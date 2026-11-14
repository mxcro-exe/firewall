from typing import Tuple, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.module_config import AttackModuleSetting
from app.modules.ddos import ddos_module
from app.modules.sqli import sqli_module
from app.modules.xss import xss_module
from app.modules.path_traversal import path_module
from app.modules.cmd_injection import cmd_module
from app.modules.brute_force import brute_force_module
from app.modules.bot_scraper import bot_module

class AttackDefenseManager:
    async def inspect_request(
        self,
        client_ip: str,
        method: str,
        path: str,
        query_string: str,
        body_text: str,
        user_agent: str,
        db: AsyncSession
    ) -> Tuple[bool, Optional[str], Optional[str], Dict[str, Any]]:
        """
        Inspect request through all 7 enabled attack-specific modules.
        Returns: (blocked, module_key, reason, details)
        """
        # Fetch enabled settings
        res = await db.execute(select(AttackModuleSetting))
        settings_list = res.scalars().all()
        active_map = {s.module_key: s.is_enabled for s in settings_list}

        full_payload = f"{query_string} {body_text}".strip()

        # 1. DDoS & Rate Limit
        if active_map.get("ddos", True):
            blocked, reason, details = ddos_module.inspect(client_ip)
            if blocked:
                await self._increment_blocked(db, "ddos")
                return True, "ddos", reason, details

        # 2. Bot & Scraper
        if active_map.get("bot", True):
            blocked, reason, details = bot_module.inspect(user_agent, path)
            if blocked:
                await self._increment_blocked(db, "bot")
                return True, "bot", reason, details

        # 3. Brute Force Login
        if active_map.get("brute", True) and ("login" in path.lower() or "auth" in path.lower()):
            blocked, reason, details = brute_force_module.inspect(client_ip, path)
            if blocked:
                await self._increment_blocked(db, "brute")
                return True, "brute", reason, details

        # 4. Path Traversal
        if active_map.get("path", True):
            check_str = f"{path} {full_payload}"
            blocked, reason, details = path_module.inspect(check_str)
            if blocked:
                await self._increment_blocked(db, "path")
                return True, "path", reason, details

        # 5. SQL Injection
        if active_map.get("sqli", True) and full_payload:
            blocked, reason, details = sqli_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "sqli")
                return True, "sqli", reason, details

        # 6. Cross-Site Scripting (XSS)
        if active_map.get("xss", True) and full_payload:
            blocked, reason, details = xss_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "xss")
                return True, "xss", reason, details

        # 7. OS Command Injection
        if active_map.get("cmd", True) and full_payload:
            blocked, reason, details = cmd_module.inspect(full_payload)
            if blocked:
                await self._increment_blocked(db, "cmd")
                return True, "cmd", reason, details

        return False, None, None, {}

    async def _increment_blocked(self, db: AsyncSession, module_key: str):
        res = await db.execute(select(AttackModuleSetting).where(AttackModuleSetting.module_key == module_key))
        setting = res.scalars().first()
        if setting:
            setting.blocked_count_24h += 1
            await db.commit()

defense_manager = AttackDefenseManager()

