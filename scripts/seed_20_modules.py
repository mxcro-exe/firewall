import sqlite3

conn = sqlite3.connect('data/patchshield.db')
cur = conn.cursor()

modules = [
    ('ddos', 'DDoS & Flood Protection', 1, 'MEDIUM', '{"rate_limit_per_min": 60, "temp_ban_minutes": 10}'),
    ('sqli', 'SQL Injection Shield', 1, 'HIGH', '{"block_union_select": true, "block_tautologies": true}'),
    ('xss', 'Cross-Site Scripting (XSS)', 1, 'HIGH', '{"block_script_tags": true, "block_event_handlers": true}'),
    ('path', 'Path Traversal & LFI Guard', 1, 'HIGH', '{"block_dot_dot": true, "block_sensitive_paths": true}'),
    ('cmd', 'OS Command Injection Blocker', 1, 'HIGH', '{"block_shell_metachars": true, "block_executables": true}'),
    ('brute', 'Brute-Force & Login Defense', 1, 'MEDIUM', '{"max_failed_attempts": 5, "window_minutes": 5}'),
    ('bot', 'Bot & Malicious Scraper Defense', 1, 'MEDIUM', '{"block_known_bad_ua": true, "challenge_unknown": false}'),
    ('ssrf', 'Server-Side Request Forgery (SSRF)', 1, 'HIGH', '{"block_cloud_metadata": true, "block_private_cidrs": true}'),
    ('recon', 'Sensitive File Reconnaissance', 1, 'HIGH', '{"protect_env": true, "protect_git": true, "protect_backups": true}'),
    ('xxe', 'XML External Entity (XXE) Shield', 1, 'HIGH', '{"block_dtd_entities": true, "block_system_identifiers": true}'),
    ('ssti', 'Server-Side Template Injection (SSTI)', 1, 'HIGH', '{"block_jinja_twig": true, "block_class_traversal": true}'),
    ('deserial', 'Insecure Deserialization Guard', 1, 'HIGH', '{"block_pickle": true, "block_php_serialize": true, "block_java_gadgets": true}'),
    ('redirect', 'Open URL Redirection (Phishing)', 1, 'MEDIUM', '{"block_untrusted_redirects": true, "block_protocol_schemes": true}'),
    ('csrf', 'CSRF & Origin Validation', 1, 'MEDIUM', '{"verify_origin": true, "block_external_state_change": true}'),
    ('nosql', 'NoSQL Injection Shield', 1, 'HIGH', '{"block_mongo_operators": true, "block_where_clauses": true}'),
    ('smuggling', 'HTTP Request Smuggling & CRLF', 1, 'HIGH', '{"block_crlf_split": true, "enforce_te_cl_rfc": true}'),
    ('ldap', 'LDAP Injection Defense', 1, 'HIGH', '{"block_ldap_wildcards": true, "block_filter_metachars": true}'),
    ('graphql', 'GraphQL Abuse & Introspection', 1, 'MEDIUM', '{"block_introspection": true, "max_query_depth": 8}'),
    ('mass_assign', 'Mass Assignment & Parameter Tampering', 1, 'HIGH', '{"block_privilege_escalation": true, "block_param_pollution": true}'),
    ('proto_abuse', 'Protocol & WebSocket Abuse', 1, 'HIGH', '{"block_illegal_methods": true, "block_null_bytes": true}')
]

for key, name, enabled, sens, conf in modules:
    cur.execute('SELECT module_key FROM attack_module_settings WHERE module_key = ?', (key,))
    if not cur.fetchone():
        cur.execute(
            'INSERT INTO attack_module_settings (module_key, module_name, is_enabled, sensitivity, custom_config_json, blocked_count_24h, updated_at) VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)',
            (key, name, enabled, sens, conf)
        )

conn.commit()
count = cur.execute('SELECT COUNT(*) FROM attack_module_settings').fetchone()[0]
print(f"Total attack defense modules active in database: {count}")
conn.close()

