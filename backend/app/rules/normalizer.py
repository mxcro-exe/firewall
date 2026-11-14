import re
import urllib.parse
import html
import base64
from typing import Tuple, List

def normalize_string(raw_text: str) -> Tuple[str, bool, List[str]]:
    """
    Multi-layer iterative normalizer to strip evasions:
    1. Recursive URL decoding (up to 3 passes)
    2. HTML entity unescaping (&quot;, &#x27;, &lt;, etc.)
    3. Unicode escape decoding (\\u0027)
    4. Hex escape decoding (\\x27)
    5. SQL inline comment stripping (SEL/**/ECT -> SELECT)
    6. Base64 payload detection probe
    """
    if not raw_text or not isinstance(raw_text, str):
        return "", False, []

    techniques = []
    text = raw_text

    # 1. Recursive URL decoding
    for i in range(3):
        decoded = urllib.parse.unquote(text)
        if decoded != text:
            techniques.append(f"url_decode_pass_{i+1}")
            text = decoded
        else:
            break

    # 2. HTML unescaping
    unescaped = html.unescape(text)
    if unescaped != text:
        techniques.append("html_entity_unescape")
        text = unescaped

    # 3. Unicode escape decoding
    try:
        if "\\u" in text:
            decoded_unicode = re.sub(
                r'\\u([0-9a-fA-F]{4})',
                lambda m: chr(int(m.group(1), 16)),
                text
            )
            if decoded_unicode != text:
                techniques.append("unicode_unescape")
                text = decoded_unicode
    except Exception:
        pass

    # 4. Hex escape decoding
    try:
        if "\\x" in text:
            decoded_hex = re.sub(
                r'\\x([0-9a-fA-F]{2})',
                lambda m: chr(int(m.group(1), 16)),
                text
            )
            if decoded_hex != text:
                techniques.append("hex_unescape")
                text = decoded_hex
    except Exception:
        pass

    # 5. SQL comment stripping
    if "/*" in text and "*/" in text:
        stripped_sql = re.sub(r'/\*.*?\*/', '', text)
        if stripped_sql != text:
            techniques.append("sql_comment_bypass")
            text = stripped_sql

    # 6. Base64 probe
    b64_match = re.search(r'([A-Za-z0-9+/]{20,}={0,2})', text)
    if b64_match:
        try:
            b64_candidate = b64_match.group(1)
            decoded_b64 = base64.b64decode(b64_candidate).decode('utf-8', errors='ignore')
            if any(kw in decoded_b64.lower() for kw in ['select', '<script', '../', 'whoami', 'bash']):
                techniques.append("base64_embedded_payload")
                text = f"{text} {decoded_b64}"
        except Exception:
            pass

    return text, len(techniques) > 0, techniques
