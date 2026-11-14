import httpx
from typing import AsyncIterator, Dict, Any, Optional
from fastapi import Request, Response
from fastapi.responses import StreamingResponse

# RFC 2616 / RFC 7230 Hop-by-Hop headers
HOP_BY_HOP_HEADERS = {
    "connection", "keep-alive", "proxy-authenticate", 
    "proxy-authorization", "te", "trailers", 
    "transfer-encoding", "upgrade", "content-length"
}

class StreamingReverseProxy:
    """
    High-Performance Asynchronous Streaming Reverse Proxy.
    Uses non-blocking HTTP connection pooling and chunked streaming 
    to forward multi-megabyte payloads with sub-1ms overhead and minimal memory footprints.
    """
    def __init__(self):
        # Configure tuned connection pool with keep-alive reuse
        self.limits = httpx.Limits(
            max_keepalive_connections=200,
            max_connections=1000,
            keepalive_expiry=60.0
        )
        self.timeout = httpx.Timeout(
            connect=5.0,
            read=30.0,
            write=10.0,
            pool=5.0
        )
        self.client = httpx.AsyncClient(
            limits=self.limits,
            timeout=self.timeout,
            follow_redirects=False,
            http2=False
        )

    def extract_client_ip(self, request: Request) -> str:
        """
        Extracts original client IP respecting trusted proxy headers:
        CF-Connecting-IP, X-Real-IP, X-Forwarded-For, or direct socket address.
        """
        headers_map = {k.lower(): v for k, v in request.headers.items()} if hasattr(request, "headers") else {}

        # 1. Cloudflare header
        cf_ip = headers_map.get("cf-connecting-ip")
        if cf_ip:
            return cf_ip.strip()

        # 2. X-Real-IP header
        real_ip = headers_map.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

        # 3. X-Forwarded-For (leftmost client IP)
        x_forwarded = headers_map.get("x-forwarded-for")
        if x_forwarded:
            return x_forwarded.split(",")[0].strip()

        # 4. Fallback to direct client socket
        return request.client.host if (hasattr(request, "client") and request.client) else "127.0.0.1"

    def filter_forward_headers(self, request: Request, client_ip: str) -> Dict[str, str]:
        """Strip hop-by-hop headers and attach client IP provenance headers."""
        forwarded_headers: Dict[str, str] = {}
        for key, value in request.headers.items():
            k_lower = key.lower()
            if k_lower not in HOP_BY_HOP_HEADERS and k_lower != "host":
                forwarded_headers[key] = value

        # Provenance headers
        headers_map = {k.lower(): v for k, v in request.headers.items()} if hasattr(request, "headers") else {}
        existing_xff = headers_map.get("x-forwarded-for")
        forwarded_headers["X-Forwarded-For"] = f"{existing_xff}, {client_ip}" if existing_xff else client_ip
        forwarded_headers["X-Forwarded-Proto"] = request.url.scheme
        forwarded_headers["X-Forwarded-Host"] = headers_map.get("host", "")
        forwarded_headers["X-PatchShield-Gateway"] = "Streaming-v2.0"

        return forwarded_headers

    async def stream_request_body(self, request: Request) -> AsyncIterator[bytes]:
        """Asynchronously stream chunks of incoming request body without full buffering."""
        async for chunk in request.stream():
            yield chunk

    async def stream_upstream(
        self,
        request: Request,
        target_url: str,
        body_bytes: Optional[bytes] = None
    ) -> Response:
        """
        Streams request to upstream target and streams response back to client in non-blocking chunks.
        """
        client_ip = self.extract_client_ip(request)
        forward_headers = self.filter_forward_headers(request, client_ip)

        req_content = body_bytes if body_bytes is not None else self.stream_request_body(request)

        # Build streaming request
        upstream_req = self.client.build_request(
            method=request.method,
            url=target_url,
            headers=forward_headers,
            content=req_content
        )

        upstream_resp = await self.client.send(upstream_req, stream=True)

        # Prepare clean response headers
        resp_headers: Dict[str, str] = {}
        for k, v in upstream_resp.headers.items():
            if k.lower() not in HOP_BY_HOP_HEADERS:
                resp_headers[k] = v

        async def response_stream() -> AsyncIterator[bytes]:
            try:
                async for chunk in upstream_resp.aiter_raw():
                    yield chunk
            finally:
                await upstream_resp.aclose()

        return StreamingResponse(
            response_stream(),
            status_code=upstream_resp.status_code,
            headers=resp_headers,
            media_type=upstream_resp.headers.get("content-type")
        )

    async def aclose(self):
        await self.client.aclose()

streaming_proxy = StreamingReverseProxy()
