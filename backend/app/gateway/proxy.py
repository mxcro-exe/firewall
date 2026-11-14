import re
import json
import httpx
from datetime import datetime
from typing import Optional, Tuple
from fastapi import Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.site import Site
from app.models.traffic import TrafficLog
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
        # Redact common password / token fields in JSON or form-data
        text = re.sub(r'("(?:password|token|secret|api_key|credit_card)"\s*:\s*)"[^"]+"', r'\1"[REDACTED]"', text, flags=re.IGNORECASE)
        text = re.sub(r'((?:password|token|secret|api_key)=)[^&]+', r'\1[REDACTED]', text, flags=re.IGNORECASE)
        return text[:2000]  # Store first 2000 chars
    except Exception:
        return "[NON-UTF8-DATA]"

class ReverseProxyHandler:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=False)

    async def resolve_site(self, request: Request, db: AsyncSession, site_id: Optional[str] = None) -> Optional[Site]:
        if site_id:
            res = await db.execute(select(Site).where(Site.id == site_id, Site.is_active == True))
            return res.scalars().first()
            
        # Check X-Site-ID header
        custom_site_id = request.headers.get("X-Site-ID")
        if custom_site_id:
            res = await db.execute(select(Site).where(Site.id == custom_site_id, Site.is_active == True))
            site = res.scalars().first()
            if site:
                return site

        # Check Host header
        host = request.headers.get("host", "").split(":")[0].lower()
        res = await db.execute(select(Site).where(Site.domain_or_host == host, Site.is_active == True))
        site = res.scalars().first()
        if site:
            return site

        # Default fallback to first active site if available
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

            # Read client body
            body = await request.body()
            client_ip = request.client.host if request.client else "127.0.0.1"

            # Prepare upstream target URL
            target_url = f"{site.upstream_url.rstrip('/')}/{path.lstrip('/')}"
            if request.url.query:
                target_url = f"{target_url}?{request.url.query}"

            # Prepare headers to forward
            req_headers = {}
            for k, v in request.headers.items():
                if k.lower() not in HOP_BY_HOP_HEADERS and k.lower() != "host":
                    req_headers[k] = v
            req_headers["X-Forwarded-For"] = client_ip
            req_headers["X-Forwarded-Proto"] = request.url.scheme
            req_headers["X-PatchShield-Gateway"] = "Active"

            try:
                # Forward to upstream
                upstream_resp = await self.client.request(
                    method=request.method,
                    url=target_url,
                    headers=req_headers,
                    content=body
                )

                # Filter response headers
                resp_headers = {}
                for k, v in upstream_resp.headers.items():
                    if k.lower() not in HOP_BY_HOP_HEADERS:
                        resp_headers[k] = v

                # Log traffic asynchronously
                traffic_log = TrafficLog(
                    site_id=site.id,
                    timestamp=datetime.utcnow(),
                    client_ip=client_ip,
                    method=request.method,
                    path=f"/{path.lstrip('/')}",
                    query_params_sanitized=request.url.query,
                    body_sanitized=sanitize_payload(body),
                    headers_sanitized=sanitize_headers(dict(request.headers)),
                    ml_score=0.0,
                    ml_prediction="Benign",
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
