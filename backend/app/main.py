import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.site import Site
from app.models.module_config import AttackModuleSetting
from app.models.audit import AuditLog
from app.api.auth import router as auth_router
from app.api.sites import router as sites_router
from app.api.settings import router as settings_router
from app.api.audit import router as audit_router
from app.api.cve import router as cve_router
from app.api.inventory import router as inventory_router
from app.api.rules import router as rules_router
from app.api.prove_patch import router as prove_patch_router
from app.api.traffic import router as traffic_router
from app.api.attack_modules import router as attack_modules_router
from app.api.agent import router as agent_router
from app.api.alerts import router as alerts_router
from app.api.metrics import router as metrics_router
from app.api.health import router as health_router
from app.api.reports import router as reports_router
from app.intel.sync import sync_vulnerability_database
from app.gateway.proxy import proxy_handler

async def seed_initial_data():
    async with AsyncSessionLocal() as db:
        # 1. Seed Admin User
        admin_res = await db.execute(select(User).where(User.username == "admin"))
        if not admin_res.scalars().first():
            admin_user = User(
                username="admin",
                email="admin@patchshield.local",
                password_hash=get_password_hash("Admin@123!"),
                role="ADMIN",
                is_first_run_completed=True
            )
            db.add(admin_user)
            db.add(AuditLog(
                actor="system",
                role="SYSTEM",
                action="SYSTEM_INIT",
                target_entity="User",
                details="Seeded initial admin account"
            ))

        # 2. Seed Default Demo Site (Vulnerable Demo Store)
        site_res = await db.execute(select(Site).where(Site.name == "Demo Store"))
        if not site_res.scalars().first():
            demo_site = Site(
                name="Demo Store",
                domain_or_host="localhost",
                upstream_url="http://127.0.0.1:9000",
                listen_port=8000,
                security_mode="PROTECT",
                health_score=88,
                bypass_detected=False
            )
            db.add(demo_site)

        # 3. Seed 20 Attack Defense Modules
        default_modules = [
            ("ddos", "DDoS & Flood Protection", True, "MEDIUM", '{"rate_limit_per_min": 60, "temp_ban_minutes": 10}'),
            ("sqli", "SQL Injection Shield", True, "HIGH", '{"block_union_select": true, "block_tautologies": true}'),
            ("xss", "Cross-Site Scripting (XSS)", True, "HIGH", '{"block_script_tags": true, "block_event_handlers": true}'),
            ("path", "Path Traversal & LFI Guard", True, "HIGH", '{"block_dot_dot": true, "block_sensitive_paths": true}'),
            ("cmd", "OS Command Injection Blocker", True, "HIGH", '{"block_shell_metachars": true, "block_executables": true}'),
            ("brute", "Brute-Force & Login Defense", True, "MEDIUM", '{"max_failed_attempts": 5, "window_minutes": 5}'),
            ("bot", "Bot & Malicious Scraper Defense", True, "MEDIUM", '{"block_known_bad_ua": true, "challenge_unknown": false}'),
            ("ssrf", "Server-Side Request Forgery (SSRF)", True, "HIGH", '{"block_cloud_metadata": true, "block_private_cidrs": true}'),
            ("recon", "Sensitive File Reconnaissance", True, "HIGH", '{"protect_env": true, "protect_git": true, "protect_backups": true}'),
            ("xxe", "XML External Entity (XXE) Shield", True, "HIGH", '{"block_dtd_entities": true, "block_system_identifiers": true}'),
            ("ssti", "Server-Side Template Injection (SSTI)", True, "HIGH", '{"block_jinja_twig": true, "block_class_traversal": true}'),
            ("deserial", "Insecure Deserialization Guard", True, "HIGH", '{"block_pickle": true, "block_php_serialize": true, "block_java_gadgets": true}'),
            ("redirect", "Open URL Redirection (Phishing)", True, "MEDIUM", '{"block_untrusted_redirects": true, "block_protocol_schemes": true}'),
            ("csrf", "CSRF & Origin Validation", True, "MEDIUM", '{"verify_origin": true, "block_external_state_change": true}'),
            ("nosql", "NoSQL Injection Shield", True, "HIGH", '{"block_mongo_operators": true, "block_where_clauses": true}'),
            ("smuggling", "HTTP Request Smuggling & CRLF", True, "HIGH", '{"block_crlf_split": true, "enforce_te_cl_rfc": true}'),
            ("ldap", "LDAP Injection Defense", True, "HIGH", '{"block_ldap_wildcards": true, "block_filter_metachars": true}'),
            ("graphql", "GraphQL Abuse & Introspection", True, "MEDIUM", '{"block_introspection": true, "max_query_depth": 8}'),
            ("mass_assign", "Mass Assignment & Parameter Tampering", True, "HIGH", '{"block_privilege_escalation": true, "block_param_pollution": true}'),
            ("proto_abuse", "Protocol & WebSocket Abuse", True, "HIGH", '{"block_illegal_methods": true, "block_null_bytes": true}'),
        ]
        for key, name, enabled, sensitivity, conf in default_modules:
            mod_res = await db.execute(select(AttackModuleSetting).where(AttackModuleSetting.module_key == key))
            if not mod_res.scalars().first():
                db.add(AttackModuleSetting(
                    module_key=key,
                    module_name=name,
                    is_enabled=enabled,
                    sensitivity=sensitivity,
                    custom_config_json=conf,
                    blocked_count_24h=0
                ))

        # 4. Sync Initial CVE Intelligence Cache
        await sync_vulnerability_database(db)

        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed baseline data
    await init_db()
    await seed_initial_data()
    yield
    # Shutdown
    await proxy_handler.client.aclose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SMB-friendly, WAF-style, AI-assisted VIRTUAL PATCHING gateway (Nasscom ARB 2.0 PS5)",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(sites_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(cve_router, prefix=settings.API_V1_STR)
app.include_router(inventory_router, prefix=settings.API_V1_STR)
app.include_router(rules_router, prefix=settings.API_V1_STR)
app.include_router(prove_patch_router, prefix=settings.API_V1_STR)
app.include_router(traffic_router, prefix=settings.API_V1_STR)
app.include_router(attack_modules_router, prefix=settings.API_V1_STR)
app.include_router(agent_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(metrics_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "ACTIVE_PROTECTION"
    }

# OS Kernel Firewall Status & Control
@app.get(f"{settings.API_V1_STR}/kernel/status", tags=["Kernel"])
async def get_kernel_firewall_status():
    from app.network.kernel_filter import kernel_firewall
    return kernel_firewall.get_status()

@app.post(f"{settings.API_V1_STR}/kernel/ban", tags=["Kernel"])
async def ban_ip_in_kernel(ip: str, reason: str = "Manual Admin Block"):
    from app.core.kv_cache import kv_cache
    await kv_cache.ban_ip(ip, reason=reason)
    return {"status": "SUCCESS", "message": f"IP {ip} banned in kernel and memory cache"}

@app.post(f"{settings.API_V1_STR}/kernel/unban", tags=["Kernel"])
async def unban_ip_in_kernel(ip: str):
    from app.core.kv_cache import kv_cache
    await kv_cache.unban_ip(ip)
    return {"status": "SUCCESS", "message": f"IP {ip} unbanned from kernel"}

# Reverse Proxy Entry Points
@app.api_route("/proxy/{site_id}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_by_site_id(request: Request, site_id: str, path: str = ""):
    """Explicit multi-tenant reverse proxy route by site ID"""
    return await proxy_handler.forward_request(request, path, site_id=site_id)

@app.api_route("/_proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_by_host(request: Request, path: str = ""):
    """Host/Header resolved reverse proxy route"""
    return await proxy_handler.forward_request(request, path)

