import re
import json
import httpx
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.inventory import StackInventory

async def fingerprint_upstream_headers(upstream_url: str, site_id: str, db: AsyncSession) -> List[Dict[str, str]]:
    """Probe upstream headers to detect web server, framework and versions"""
    detected_components = []
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(upstream_url)
            headers = resp.headers

            # 1. Server header
            server_header = headers.get("server", "")
            if server_header:
                parts = server_header.split("/")
                comp = parts[0].strip()
                ver = parts[1].strip() if len(parts) > 1 else "Unknown"
                detected_components.append({
                    "name": comp.lower(),
                    "version": ver,
                    "source": "HEADER",
                    "cpe": f"cpe:2.3:a:{comp.lower()}:{comp.lower()}:{ver}:*:*:*:*:*:*:*"
                })

            # 2. X-Powered-By header
            powered_by = headers.get("x-powered-by", "")
            if powered_by:
                parts = powered_by.split("/")
                comp = parts[0].strip()
                ver = parts[1].strip() if len(parts) > 1 else "Unknown"
                detected_components.append({
                    "name": comp.lower(),
                    "version": ver,
                    "source": "HEADER",
                    "cpe": f"cpe:2.3:a:{comp.lower()}:{comp.lower()}:{ver}:*:*:*:*:*:*:*"
                })

            # 3. FastApi / OpenAPI documentation probe
            docs_resp = await client.get(f"{upstream_url.rstrip('/')}/openapi.json")
            if docs_resp.status_code == 200:
                try:
                    schema = docs_resp.json()
                    app_title = schema.get("info", {}).get("title", "api")
                    app_version = schema.get("info", {}).get("version", "1.0.0")
                    detected_components.append({
                        "name": app_title.lower().replace(" ", "_"),
                        "version": app_version,
                        "source": "OPENAPI",
                        "cpe": f"cpe:2.3:a:custom:{app_title.lower()}:{app_version}:*:*:*:*:*:*:*"
                    })
                except Exception:
                    pass

    except Exception as e:
        # If upstream is currently offline or unreachable during test, return baseline
        pass

    # Save to database
    saved = []
    for comp in detected_components:
        # Check duplicate
        res = await db.execute(select(StackInventory).where(
            StackInventory.site_id == site_id,
            StackInventory.component_name == comp["name"]
        ))
        existing = res.scalars().first()
        if existing:
            existing.version = comp["version"]
            existing.cpe_string = comp["cpe"]
            existing.detection_source = comp["source"]
            existing.detected_at = datetime.utcnow()
        else:
            item = StackInventory(
                site_id=site_id,
                component_name=comp["name"],
                version=comp["version"],
                cpe_string=comp["cpe"],
                detection_source=comp["source"],
                detected_at=datetime.utcnow()
            )
            db.add(item)
        saved.append(comp)

    await db.commit()
    return saved


def parse_manifest_content(filename: str, content: str) -> List[Dict[str, str]]:
    """Parse requirements.txt or package.json into components with versions"""
    components = []
    
    if "package.json" in filename.lower():
        try:
            data = json.loads(content)
            deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
            for pkg, ver in deps.items():
                clean_ver = re.sub(r'[\^~>=<]', '', ver).strip()
                components.append({
                    "name": pkg.lower(),
                    "version": clean_ver or "1.0.0",
                    "cpe": f"cpe:2.3:a:{pkg.lower()}:{pkg.lower()}:{clean_ver}:*:*:*:*:*:*:*"
                })
        except Exception:
            pass

    elif "requirements" in filename.lower() or filename.endswith(".txt"):
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            match = re.match(r'^([a-zA-Z0-9_\-\.]+)\s*(?:==|>=|<=|~=)\s*([a-zA-Z0-9_\-\.]+)', line)
            if match:
                pkg, ver = match.groups()
                components.append({
                    "name": pkg.lower(),
                    "version": ver.strip(),
                    "cpe": f"cpe:2.3:a:python:{pkg.lower()}:{ver.strip()}:*:*:*:*:*:*:*"
                })
            else:
                pkg_match = re.match(r'^([a-zA-Z0-9_\-\.]+)', line)
                if pkg_match:
                    pkg = pkg_match.group(1).lower()
                    components.append({
                        "name": pkg,
                        "version": "Unknown",
                        "cpe": f"cpe:2.3:a:python:{pkg}:unknown:*:*:*:*:*:*:*"
                    })

    return components
