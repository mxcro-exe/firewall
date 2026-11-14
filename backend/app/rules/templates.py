from typing import Dict, Any

RULE_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "sqli": {
        "name": "SQL Injection Parameter Shield",
        "category": "SQLi",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|WAITFOR|DELAY|BENCHMARK)\b|--|\/\*|\*\/|@@|1=1|1=0|'1'='1'|\bOR\s+\d+=\d+|\bAND\s+\d+=\d+)",
        "explanation_en": "Blocks SQL query keywords, tautologies (1=1), and comment escapes from being injected into targeted parameters.",
        "explanation_ta": "இலக்கு அளவுருக்களில் SQL வினவல் சொற்கள், கருத்து குறிகள் மற்றும் 1=1 போன்ற ஏமாற்று வினவல்கள் உட்செலுத்தப்படுவதைத் தடுக்கிறது."
    },
    "path_traversal": {
        "name": "Path Traversal & Sensitive File Guard",
        "category": "Path_Traversal",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)(\.\./|\.\.\\|%2e%2e%2f|%2e%2e/|\.\.%2f|%2e%2e%5c|/etc/passwd|/windows/win\.ini|boot\.ini|win\.ini|windows\\system32|proc/self/environ)",
        "explanation_en": "Restricts directory traversal sequences ('../') and sensitive operating system path lookups.",
        "explanation_ta": "கோப்பு பாதைகளில் '../' போன்ற அடைவு குறுக்குவழிகள் மற்றும் லினக்ஸ்/விண்டோஸ் முக்கிய கோப்புகளைப் பார்ப்பதைத் தடுக்கிறது."
    },
    "xss": {
        "name": "Cross-Site Scripting (XSS) Guard",
        "category": "XSS",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)(<script\b|javascript\s*:|vbscript\s*:|on\w+\s*=|alert\s*\(|prompt\s*\(|confirm\s*\(|document\.cookie|document\.domain|window\.location)",
        "explanation_en": "Blocks client-side HTML script tags, inline JavaScript protocols, and DOM event handler injections.",
        "explanation_ta": "வலைப்பக்கத்தில் பிற பயனர்களின் தரவைத் திருடும் ஸ்கிரிப்ட்கள் மற்றும் ஜாவாஸ்கிரிப்ட் நிகழ்வு கையாளுநர்களைத் தடுக்கிறது."
    },
    "cmd_injection": {
        "name": "OS Command Injection Blocker",
        "category": "Command_Injection",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)(;\s*(cat|ls|pwd|whoami|id|uname|netcat|nc|curl|wget|bash|sh|powershell|cmd)\b|\|\s*(cat|ls|pwd|whoami|id|uname|netcat|nc|curl|wget|bash|sh)\b|`(cat|ls|pwd|whoami|id|uname|curl|wget)`|\$\(cat|\$\(whoami)",
        "explanation_en": "Blocks operating system shell commands and pipe metacharacters (; | && ` $) from executing on the host.",
        "explanation_ta": "சேவையக கணினியில் கட்டளைகளை இயக்கும் ஷெல் ஆபரேட்டர்கள் மற்றும் பைனரி கட்டளைகளைத் தடுக்கிறது."
    },
    "ssrf": {
        "name": "Server-Side Request Forgery (SSRF) Guard",
        "category": "SSRF",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)(https?://(127\.0\.0\.1|localhost|0\.0\.0\.0|169\.254\.169\.254|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)|file://|gopher://|dict://|ldap://)",
        "explanation_en": "Blocks web applications from making unauthorized internal HTTP requests to localhost or cloud metadata IP (169.254.169.254).",
        "explanation_ta": "மேகக்கணி மெட்டாடேட்டா அல்லது உள்ளூர் நெட்வொர்க் ஐபிகளுக்கு அங்கீகரிக்கப்படாத கோரிக்கைகளை அனுப்புவதைத் தடுக்கிறது."
    },
    "file_upload": {
        "name": "Malicious Web Shell & Executable Upload Blocker",
        "category": "File_Upload",
        "pattern_type": "REGEX",
        "pattern_value": r"(?i)\.(php[0-9]?|phtml|jsp|jspx|asp|aspx|exe|sh|bash|bat|cmd|vbs|cgi|pl)(\0|\.|$)",
        "explanation_en": "Blocks executable server-side scripts and web shells from being uploaded via file input fields.",
        "explanation_ta": "சேவையகத்தை கைப்பற்றும் மலிசியஸ் PHP, JSP அல்லது ஷெல் கோப்புகள் பதிவேற்றப்படுவதைத் தடுக்கிறது."
    }
}
