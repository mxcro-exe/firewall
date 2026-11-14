import re
import json
import hashlib
import httpx
from datetime import datetime
from typing import Optional, Tuple
from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.site import Site
from app.models.rule import VirtualPatchRule
from app.models.traffic import TrafficLog
from app.rules.engine import rule_engine
from app.modules.manager import defense_manager
from app.ml.model_runner import ml_subsystem
from app.gateway.honeypot import is_honeypot_path
from app.gateway.geoip import geoip_filter
from app.core.database import AsyncSessionLocal

# Hop-by-hop headers that should not be forwarded
HOP_BY_HOP_HEADERS = {
    "connection", "keep-alive", "proxy-authenticate", 
    "proxy-authorization", "te", "trailers", 
    "transfer-encoding", "upgrade", "content-length"
}

def sanitize_headers(headers: dict) -> str:
    """Sanitize sensitive headers (Authorization, Cookies, API Keys)"""
    sanitized = {}
    for k, v in headers.items():
        k_lower = k.lower()
        if any(secret in k_lower for secret in ["auth", "cookie", "token", "key", "secret"]):
            sanitized[k] = "[REDACTED]"
        else:
            sanitized[k] = v
    return json.dumps(sanitized)

def sanitize_payload(payload_bytes: bytes) -> str:
    """Strip passwords and tokens from logged bodies"""
    try:
        text = payload_bytes.decode("utf-8", errors="ignore")
        if not text:
            return ""
        text = re.sub(r'("(?:password|token|secret|api_key|credit_card)"\s*:\s*)"[^"]+"', r'\1"[REDACTED]"', text, flags=re.IGNORECASE)
        text = re.sub(r'((?:password|token|secret|api_key)=)[^&]+', r'\1[REDACTED]', text, flags=re.IGNORECASE)
        return text[:2000]
    except Exception:
        return "[NON-UTF8-DATA]"

class ReverseProxyHandler:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=False)

    async def resolve_site(self, request: Request, db: AsyncSession, site_id: Optional[str] = None) -> Optional[Site]:
        if site_id:
            res = await db.execute(select(Site).where(Site.id == site_id, Site.is_active == True))
            return res.scalars().first()
            
        custom_site_id = request.headers.get("X-Site-ID")
        if custom_site_id:
            res = await db.execute(select(Site).where(Site.id == custom_site_id, Site.is_active == True))
            site = res.scalars().first()
            if site:
                return site

        host = request.headers.get("host", "").split(":")[0].lower()
        res = await db.execute(select(Site).where(Site.domain_or_host == host, Site.is_active == True))
        site = res.scalars().first()
        if site:
            return site

        res = await db.execute(select(Site).where(Site.is_active == True).limit(1))
        return res.scalars().first()

    async def forward_request(self, request: Request, path: str, site_id: Optional[str] = None) -> Response:
        async with AsyncSessionLocal() as db:
            site = await self.resolve_site(request, db, site_id)
            if not site:
                return Response(
                    content=json.dumps({"error": "No matching protected site configured in PatchShield"}),
                    status_code=502,
                    media_type="application/json"
                )

            body = await request.body()
            body_text = body.decode("utf-8", errors="ignore")
            client_ip = request.client.host if request.client else "127.0.0.1"
            clean_path = f"/{path.lstrip('/')}"
            query_str = request.url.query
            user_agent = request.headers.get("user-agent", "")

            # --- PRE-FILTER: HONEYPOT DECEPTION TRAP ---
            is_honey, honey_msg = is_honeypot_path(clean_path)
            if is_honey:
                log_entry = TrafficLog(
                    site_id=site.id,
                    timestamp=datetime.utcnow(),
                    client_ip=client_ip,
                    method=request.method,
                    path=clean_path,
                    query_params_sanitized=query_str,
                    body_sanitized=sanitize_payload(body),
                    headers_sanitized=sanitize_headers(dict(request.headers)),
                    ml_score=1.0,
                    ml_prediction="Honeypot_Trap",
                    rule_action="HONEYPOT_BLOCKED",
                    response_status=404
                )
                db.add(log_entry)
                await db.commit()
                return Response(
                    content=json.dumps({"error": "Not Found", "detail": "Honeypot trap triggered"}),
                    status_code=404,
                    media_type="application/json"
                )

            # --- PRE-FILTER: GEOIP & SUBNET BLOCK ---
            geo_blocked, geo_msg = geoip_filter.is_blocked_ip(client_ip)
            if geo_blocked:
                return Response(
                    content=json.dumps({"error": "Access Denied by GeoIP Filter", "reason": geo_msg}),
                    status_code=403,
                    media_type="application/json"
                )

            # --- TIER 1: SCOPED VIRTUAL PATCH RULES ---
            rules_res = await db.execute(
                select(VirtualPatchRule).where(
                    VirtualPatchRule.site_id == site.id,
                    VirtualPatchRule.is_active == True,
                    VirtualPatchRule.status.in_(["SHADOW", "CANARY", "ENFORCED"])
                )
            )
            active_rules = rules_res.scalars().all()

            matched_rule, match_context = rule_engine.evaluate(
                method=request.method,
                path=clean_path,
                query_string=query_str,
                body_text=body_text,
                rules=active_rules
            )

            if matched_rule:
                if matched_rule.status == "SHADOW" or site.security_mode == "MONITOR":
                    log_entry = TrafficLog(
                        site_id=site.id,
                        timestamp=datetime.utcnow(),
                        client_ip=client_ip,
                        method=request.method,
                        path=clean_path,
                        query_params_sanitized=query_str,
                        body_sanitized=sanitize_payload(body),
                        headers_sanitized=sanitize_headers(dict(request.headers)),
                        ml_score=0.9,
                        ml_prediction="Virtual_Patch_Shadow_Match",
                        rule_action="SHADOW_LOGGED",
                        matched_rule_id=matched_rule.id,
                        response_status=200
                    )
                    db.add(log_entry)
                    await db.commit()

                elif matched_rule.status == "CANARY":
                    ip_hash_bucket = int(hashlib.md5(client_ip.encode()).hexdigest(), 16) % 100
                    if ip_hash_bucket < 5:  # 5% canary
                        log_entry = TrafficLog(
                            site_id=site.id,
                            timestamp=datetime.utcnow(),
                            client_ip=client_ip,
                            method=request.method,
                            path=clean_path,
                            query_params_sanitized=query_str,
                            body_sanitized=sanitize_payload(body),
                            headers_sanitized=sanitize_headers(dict(request.headers)),
                            ml_score=0.99,
                            ml_prediction="Canary_Block",
                            rule_action="CANARY_BLOCKED",
                            matched_rule_id=matched_rule.id,
                            response_status=403
                        )
                        db.add(log_entry)
                        await db.commit()
                        return Response(
                            content=json.dumps({
                                "error": "Blocked by PatchShield Canary Virtual Patch",
                                "rule_name": matched_rule.name,
                                "cve_id": matched_rule.cve_id,
                                "explanation_en": matched_rule.explanation_en,
                                "explanation_ta": matched_rule.explanation_ta
                            }),
                            status_code=403,
                            media_type="application/json"
                        )

                elif matched_rule.status == "ENFORCED":
                    log_entry = TrafficLog(
                        site_id=site.id,
                        timestamp=datetime.utcnow(),
                        client_ip=client_ip,
                        method=request.method,
                        path=clean_path,
                        query_params_sanitized=query_str,
                        body_sanitized=sanitize_payload(body),
                        headers_sanitized=sanitize_headers(dict(request.headers)),
                        ml_score=1.0,
                        ml_prediction="Virtual_Patch_Enforced",
                        rule_action="ENFORCE_BLOCKED",
                        matched_rule_id=matched_rule.id,
                        response_status=403
                    )
                    db.add(log_entry)
                    await db.commit()
                    return Response(
                        content=json.dumps({
                            "error": "Request blocked by PatchShield Virtual Patch",
                            "rule_name": matched_rule.name,
                            "cve_id": matched_rule.cve_id,
                            "explanation_en": matched_rule.explanation_en,
                            "explanation_ta": matched_rule.explanation_ta
                        }),
                        status_code=403,
                        media_type="application/json"
                    )

            # --- TIER 2: 7 ATTACK-SPECIFIC DEFENCE MODULES ---
            mod_blocked, mod_key, mod_reason, mod_details = await defense_manager.inspect_request(
                client_ip=client_ip,
                method=request.method,
                path=clean_path,
                query_string=query_str,
                body_text=body_text,
                user_agent=user_agent,
                db=db
            )

            if mod_blocked:
                if site.security_mode != "MONITOR":
                    log_entry = TrafficLog(
                        site_id=site.id,
                        timestamp=datetime.utcnow(),
                        client_ip=client_ip,
                        method=request.method,
                        path=clean_path,
                        query_params_sanitized=query_str,
                        body_sanitized=sanitize_payload(body),
                        headers_sanitized=sanitize_headers(dict(request.headers)),
                        ml_score=0.95,
                        ml_prediction=f"Module_{mod_key.upper()}",
                        rule_action="MODULE_BLOCKED",
                        response_status=403
                    )
                    db.add(log_entry)
                    await db.commit()
                    return Response(
                        content=json.dumps({
                            "error": "Request blocked by Attack Defense Module",
                            "module": mod_key,
                            "reason": mod_reason,
                            "details": mod_details
                        }),
                        status_code=403,
                        media_type="application/json"
                    )
                else:
                    # In Monitor mode, record shadow match
                    log_entry = TrafficLog(
                        site_id=site.id,
                        timestamp=datetime.utcnow(),
                        client_ip=client_ip,
                        method=request.method,
                        path=clean_path,
                        query_params_sanitized=query_str,
                        body_sanitized=sanitize_payload(body),
                        headers_sanitized=sanitize_headers(dict(request.headers)),
                        ml_score=0.95,
                        ml_prediction=f"Module_{mod_key.upper()}",
                        rule_action="SHADOW_LOGGED",
                        response_status=200
                    )
                    db.add(log_entry)
                    await db.commit()

            # --- TIER 3: 23-FEATURE RANDOM FOREST ML FALLBACK ---
            ml_res = ml_subsystem.predict(
                method=request.method,
                path=clean_path,
                query_string=query_str,
                body=body_text,
                headers=dict(request.headers)
            )

            if ml_res["prediction"] != "Benign" and ml_res["confidence"] >= 0.85 and site.security_mode == "STRICT":
                log_entry = TrafficLog(
                    site_id=site.id,
                    timestamp=datetime.utcnow(),
                    client_ip=client_ip,
                    method=request.method,
                    path=clean_path,
                    query_params_sanitized=query_str,
                    body_sanitized=sanitize_payload(body),
                    headers_sanitized=sanitize_headers(dict(request.headers)),
                    ml_score=ml_res["confidence"],
                    ml_prediction=f"ML_{ml_res['prediction']}",
                    rule_action="ML_BLOCKED",
                    response_status=403
                )
                db.add(log_entry)
                await db.commit()
                return Response(
                    content=json.dumps({
                        "error": "Request blocked by ML Fallback Anomaly Classifier",
                        "predicted_threat": ml_res["prediction"],
                        "confidence": ml_res["confidence"],
                        "top_features": ml_res["top_features"]
                    }),
                    status_code=403,
                    media_type="application/json"
                )

            # Upstream target forwarding
            target_url = f"{site.upstream_url.rstrip('/')}/{path.lstrip('/')}"
            if request.url.query:
                target_url = f"{target_url}?{request.url.query}"

            req_headers = {}
            for k, v in request.headers.items():
                if k.lower() not in HOP_BY_HOP_HEADERS and k.lower() != "host":
                    req_headers[k] = v
            req_headers["X-Forwarded-For"] = client_ip
            req_headers["X-Forwarded-Proto"] = request.url.scheme
            req_headers["X-PatchShield-Gateway"] = "Active"

            try:
                upstream_resp = await self.client.request(
                    method=request.method,
                    url=target_url,
                    headers=req_headers,
                    content=body
                )

                resp_headers = {}
                for k, v in upstream_resp.headers.items():
                    if k.lower() not in HOP_BY_HOP_HEADERS:
                        resp_headers[k] = v

                # Normal traffic logging with ML evaluation
                traffic_log = TrafficLog(
                    site_id=site.id,
                    timestamp=datetime.utcnow(),
                    client_ip=client_ip,
                    method=request.method,
                    path=clean_path,
                    query_params_sanitized=request.url.query,
                    body_sanitized=sanitize_payload(body),
                    headers_sanitized=sanitize_headers(dict(request.headers)),
                    ml_score=ml_res["confidence"] if ml_res["prediction"] != "Benign" else 0.0,
                    ml_prediction=ml_res["prediction"],
                    rule_action="PASSED",
                    response_status=upstream_resp.status_code
                )
                db.add(traffic_log)
                await db.commit()

                return Response(
                    content=upstream_resp.content,
                    status_code=upstream_resp.status_code,
                    headers=resp_headers,
                    media_type=upstream_resp.headers.get("content-type")
                )

            except httpx.ConnectError:
                return Response(
                    content=json.dumps({
                        "error": "Upstream service unavailable",
                        "upstream_url": site.upstream_url,
                        "tip": "Verify backend server is running and reachable"
                    }),
                    status_code=502,
                    media_type="application/json"
                )
            except Exception as e:
                return Response(
                    content=json.dumps({"error": f"Gateway proxy error: {str(e)}"}),
                    status_code=500,
                    media_type="application/json"
                )

proxy_handler = ReverseProxyHandler()
