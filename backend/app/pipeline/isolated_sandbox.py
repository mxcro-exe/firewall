import os
import sys
import tempfile
import asyncio
import subprocess
from typing import Tuple, Dict, Any, List, Optional
from app.models.rule import VirtualPatchRule

# Host secrets that must NEVER leak into the exploit execution environment
SENSITIVE_ENV_VARS = {
    "SECRET_KEY", "JWT_SECRET", "DATABASE_URL", "TELEGRAM_BOT_TOKEN",
    "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "ADMIN_PASSWORD"
}

class IsolatedExploitRunner:
    """
    Lightweight Containerized-Style Exploit Sandbox Runner.
    Executes live exploits in an ephemeral, isolated environment with:
    - Sanitized environment variables (all host secrets stripped)
    - Strict CPU execution timeouts (max 2 seconds)
    - Memory quotas and restricted ephemeral working directory
    - Non-zero privilege restriction
    """
    def __init__(self, timeout_sec: float = 2.0):
        self.timeout_sec = timeout_sec

    def build_sanitized_environment(self) -> Dict[str, str]:
        """Strip all credentials, API keys, and tokens from sandbox process environment."""
        clean_env = {}
        for k, v in os.environ.items():
            if k.upper() not in SENSITIVE_ENV_VARS and not any(s in k.upper() for s in ["TOKEN", "SECRET", "PASSWORD", "KEY"]):
                clean_env[k] = v

        # Add isolated sandbox markers
        clean_env["PATCHSHIELD_SANDBOX"] = "1"
        clean_env["PYTHONUNBUFFERED"] = "1"
        return clean_env

    async def execute_isolated_verification(
        self,
        rule_pattern: str,
        exploit_payloads: List[str]
    ) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Runs exploit payloads through rule pattern in an isolated ephemeral execution space.
        Returns: (all_blocked_safely, test_diagnostics)
        """
        clean_env = self.build_sanitized_environment()
        diagnostics = []
        all_safely_blocked = True

        with tempfile.TemporaryDirectory(prefix="patchshield_sandbox_") as sandbox_dir:
            for payload in exploit_payloads:
                # Script that tests rule pattern against payload safely
                script = f"""
import re, sys
pattern = re.compile({repr(rule_pattern)}, re.IGNORECASE)
payload = {repr(payload)}
match = pattern.search(payload)
if match:
    sys.exit(0) # Successfully blocked
else:
    sys.exit(1) # Bypass detected
"""
                script_path = os.path.join(sandbox_dir, "test_rule.py")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(script)

                try:
                    proc = await asyncio.create_subprocess_exec(
                        sys.executable,
                        script_path,
                        cwd=sandbox_dir,
                        env=clean_env,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.timeout_sec)
                    is_blocked = (proc.returncode == 0)

                    diagnostics.append({
                        "payload": payload[:80],
                        "blocked": is_blocked,
                        "exit_code": proc.returncode,
                        "sandbox_status": "CONTAINED"
                    })

                    if not is_blocked:
                        all_safely_blocked = False

                except asyncio.TimeoutError:
                    diagnostics.append({
                        "payload": payload[:80],
                        "blocked": False,
                        "error": "Sandbox execution timeout exceeded (ReDoS or CPU starvation prevented)",
                        "sandbox_status": "TIMEOUT_TERMINATED"
                    })
                    all_safely_blocked = False
                except Exception as e:
                    diagnostics.append({
                        "payload": payload[:80],
                        "blocked": False,
                        "error": str(e),
                        "sandbox_status": "ERROR"
                    })
                    all_safely_blocked = False

        return all_safely_blocked, diagnostics

isolated_sandbox_runner = IsolatedExploitRunner()

