from typing import Tuple, Dict, Any
from app.models.rule import VirtualPatchRule
from app.rules.engine import rule_engine

SAFE_EXPLOIT_SAMPLES = {
    "sqli": [
        "' UNION SELECT 1, @@version, user() --",
        "admin' OR 1=1 --",
        "1; DROP TABLE users--"
    ],
    "path_traversal": [
        "../../../../etc/passwd",
        "..%2f..%2f..%2fwindows/win.ini",
        "../../../etc/shadow"
    ],
    "xss": [
        "<script>alert('PatchShield-POC')</script>",
        "\" onmouseover=\"alert(1)\"",
        "javascript:alert(document.domain)"
    ],
    "cmd_injection": [
        "; whoami",
        "| cat /etc/passwd",
        "&& id"
    ],
    "ssrf": [
        "http://169.254.169.254/latest/meta-data/",
        "http://127.0.0.1:22/"
    ],
    "file_upload": [
        "shell.php",
        "backdoor.phtml",
        "exploit.jsp"
    ]
}

def run_sandbox_exploit_test(rule: VirtualPatchRule) -> Tuple[bool, Dict[str, Any]]:
    """
    Stage 1: Prove that the rule reliably blocks standard exploit vectors
    without syntax failure or bypasses.
    """
    category = "sqli"
    name_lower = (rule.name + " " + (rule.cve_id or "")).lower()
    if "traversal" in name_lower or "path" in name_lower:
        category = "path_traversal"
    elif "xss" in name_lower or "script" in name_lower:
        category = "xss"
    elif "cmd" in name_lower or "command" in name_lower:
        category = "cmd_injection"
    elif "ssrf" in name_lower:
        category = "ssrf"
    elif "upload" in name_lower or "file" in name_lower:
        category = "file_upload"

    samples = SAFE_EXPLOIT_SAMPLES.get(category, SAFE_EXPLOIT_SAMPLES["sqli"])
    test_results = []
    all_blocked = True

    for sample in samples:
        query_str = f"{rule.target_param}={sample}" if rule.target_param else f"q={sample}"
        body_str = sample

        matched, details = rule_engine.evaluate(
            method=rule.http_method if rule.http_method != "ANY" else "GET",
            path=rule.endpoint_path,
            query_string=query_str,
            body_text=body_str,
            rules=[rule]
        )

        if matched:
            test_results.append({
                "payload": sample,
                "blocked": True,
                "matched_pattern": details.get("matched_text")
            })
        else:
            all_blocked = False
            test_results.append({
                "payload": sample,
                "blocked": False,
                "error": "Payload bypassed virtual patch rule"
            })

    return all_blocked, {
        "category": category,
        "total_probes": len(samples),
        "blocked_count": sum(1 for r in test_results if r["blocked"]),
        "status": "PASS" if all_blocked else "FAIL",
        "samples": test_results
    }
