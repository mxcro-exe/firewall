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

        # 3. Seed 7 Attack Defense Modules
        default_modules = [
            ("ddos", "DDoS & Flood Protection", True, "MEDIUM", '{"rate_limit_per_min": 60, "temp_ban_minutes": 10}'),
            ("sqli", "SQL Injection Shield", True, "HIGH", '{"block_union_select": true, "block_tautologies": true}'),
            ("xss", "Cross-Site Scripting (XSS)", True, "HIGH", '{"block_script_tags": true, "block_event_handlers": true}'),
            ("path", "Path Traversal & LFI Guard", True, "HIGH", '{"block_dot_dot": true, "block_sensitive_paths": true}'),
            ("cmd", "OS Command Injection Blocker", True, "HIGH", '{"block_shell_metachars": true, "block_executables": true}'),
            ("brute", "Brute-Force & Login Defense", True, "MEDIUM", '{"max_failed_attempts": 5, "window_minutes": 5}'),
            ("bot", "Bot & Malicious Scraper Defense", True, "MEDIUM", '{"block_known_bad_ua": true, "challenge_unknown": false}'),
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

@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "ACTIVE_PROTECTION"
    }

# Reverse Proxy Entry Points
@app.api_route("/proxy/{site_id}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_by_site_id(request: Request, site_id: str, path: str = ""):
    """Explicit multi-tenant reverse proxy route by site ID"""
    return await proxy_handler.forward_request(request, path, site_id=site_id)

@app.api_route("/_proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_by_host(request: Request, path: str = ""):
    """Host/Header resolved reverse proxy route"""
    return await proxy_handler.forward_request(request, path)
