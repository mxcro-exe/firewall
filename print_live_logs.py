import sqlite3
import urllib.request
import urllib.error
import json
import time

print("=" * 65)
print("     PATCHSHIELD LIVE PACKET & TRAFFIC INTERCEPTOR LOGS     ")
print("=" * 65)

# 1. Send Normal Request
print("\n[STEP 1] INCOMING PACKET: Legitimate Customer (q=coffee)")
try:
    with urllib.request.urlopen("http://localhost:8000/_proxy/api/products?q=coffee") as resp:
        print(f"  -> Gateway Decision: HTTP {resp.status} OK (CLEAN TRAFFIC FORWARDED)")
except Exception as e:
    print(f"  -> Error: {e}")

# 2. Send SQL Injection Attack
print("\n[STEP 2] INCOMING PACKET: SQL Injection Attack (' UNION SELECT @@version)")
try:
    urllib.request.urlopen("http://localhost:8000/_proxy/api/products?q=coffee%27+UNION+SELECT+1,2,@@version--")
except urllib.error.HTTPError as e:
    print(f"  -> Gateway Decision: HTTP {e.code} FORBIDDEN (ATTACK TERMINATED)")
    body = json.loads(e.read().decode('utf-8'))
    print(f"     Module Triggered : {body.get('module')}")
    print(f"     Scanning Verdict : {body.get('reason')}")
    print(f"     Obfuscation Pass : {body.get('details', {}).get('techniques')}")

# 3. Send Path Traversal Attack
print("\n[STEP 3] INCOMING PACKET: Path Traversal (../../../../etc/passwd)")
try:
    urllib.request.urlopen("http://localhost:8000/_proxy/api/preview?filename=../../../../etc/passwd")
except urllib.error.HTTPError as e:
    print(f"  -> Gateway Decision: HTTP {e.code} FORBIDDEN (ATTACK TERMINATED)")
    body = json.loads(e.read().decode('utf-8'))
    print(f"     Module Triggered : {body.get('module')}")
    print(f"     Scanning Verdict : {body.get('reason')}")

# 4. Fetch the real traffic logs from SQLite
print("\n" + "=" * 65)
print("      REAL TRAFFIC DATABASE LOGS (Direct from data/patchshield.db)")
print("=" * 65)
conn = sqlite3.connect("data/patchshield.db")
cursor = conn.cursor()
cursor.execute("SELECT timestamp, client_ip, method, path, query_params_sanitized, rule_action, response_status FROM traffic_logs ORDER BY id DESC LIMIT 5")
rows = cursor.fetchall()
print(f"{'TIMESTAMP':<20} | {'CLIENT IP':<15} | {'METHOD':<6} | {'PATH & QUERY':<30} | {'VERDICT':<16} | {'STATUS'}")
print("-" * 105)
for r in rows:
    ts, ip, method, path, q, action, status = r
    full_path = f"{path}?{q}" if q else path
    print(f"{str(ts)[:19]:<20} | {ip:<15} | {method:<6} | {full_path[:30]:<30} | {action:<16} | HTTP {status}")
conn.close()
print("=" * 105)
