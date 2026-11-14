import uvicorn
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse

app = FastAPI(title="SMB Demo Storefront (Vulnerable Target App)", version="2.4.0")

PRODUCTS_DB = [
    {"id": 1, "name": "Organic Filter Coffee 500g", "price": 340, "category": "Beverages"},
    {"id": 2, "name": "Pure Kanchipuram Silk Saree", "price": 4500, "category": "Clothing"},
    {"id": 3, "name": "Handmade Brass Diya Lamp", "price": 650, "category": "Home Decor"},
    {"id": 4, "name": "Madurai Jasmine Flower Basket", "price": 200, "category": "Pooja"},
    {"id": 5, "name": "Traditional Clay Cooking Pot", "price": 420, "category": "Kitchen"},
]

@app.get("/", response_class=HTMLResponse)
async def storefront_home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Sri Murugan Organics & Handlooms - SMB Store</title>
        <style>
            body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8fafc; color: #1e293b; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            h1 { color: #4f46e5; margin-bottom: 5px; }
            .badge { background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
            .product { border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; justify-content: space-between; }
            .search-box { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 15px 0; box-sizing: border-box; }
        </style>
    </head>
    <body>
        <div class="container">
            <span class="badge">SMB DEMO STORE (Vulnerable Target on :9000)</span>
            <h1>Sri Murugan Organics & Handlooms</h1>
            <p style="color: #64748b; font-size: 13px;">Traditional Indian SMB Web App protected by PatchShield Gateway.</p>
            <input class="search-box" type="text" placeholder="Search products (vulnerable to SQLi if unprotected)..." />
            <div id="products">
                <div class="product"><span>Organic Filter Coffee 500g</span><strong>₹340</strong></div>
                <div class="product"><span>Pure Kanchipuram Silk Saree</span><strong>₹4,500</strong></div>
                <div class="product"><span>Handmade Brass Diya Lamp</span><strong>₹650</strong></div>
                <div class="product"><span>Traditional Clay Cooking Pot</span><strong>₹420</strong></div>
            </div>
        </div>
    </body>
    </html>
    """

# 1. SQL Injection vulnerability (CVE-2023-38606 simulation on storefront product search)
@app.get("/api/products")
async def search_products(q: str = Query("", description="Search term")):
    # Deliberate simulated SQL vulnerability when accessed directly
    if "'" in q or "union" in q.lower():
        return {
            "vulnerable_simulation": True,
            "simulated_error": "Syntax error in SQL statement: SELECT * FROM products WHERE name LIKE '%" + q + "%'",
            "leaked_database_version": "PostgreSQL 14.2 (Ubuntu 14.2-1ubuntu1)",
            "leaked_admin_hash": "$2b$12$Ty6Il2pmLTYEFtRFJ8iVXu0GQMrPe7REYqKR"
        }

    results = [p for p in PRODUCTS_DB if not q or q.lower() in p["name"].lower() or q.lower() in p["category"].lower()]
    return {"status": "success", "count": len(results), "products": results}

# 2. Path Traversal vulnerability (CVE-2023-3452 simulation)
@app.get("/api/preview")
async def preview_document(filename: str = Query("invoice.pdf")):
    if ".." in filename or "passwd" in filename:
        return {
            "vulnerable_simulation": True,
            "filename": filename,
            "file_contents": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n"
        }
    return {"status": "success", "file": filename, "content_type": "application/pdf", "size_bytes": 10240}

# 3. Command Injection vulnerability
@app.get("/api/system/ping")
async def ping_server(host: str = Query("127.0.0.1")):
    if ";" in host or "|" in host or "whoami" in host:
        return {
            "vulnerable_simulation": True,
            "executed_command": f"ping -c 1 {host}",
            "command_output": "uid=1000(shopkeeper) gid=1000(shopkeeper) groups=1000(shopkeeper),27(sudo)"
        }
    return {"status": "success", "host": host, "latency_ms": 1.2}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)
