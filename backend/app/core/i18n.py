"""
PatchShield Internationalization (i18n) Helper Module
Loads UTF-8 JSON translation catalogs once.
Supports placeholders: {site}, {endpoint}, {cve_id}, {action}, etc.
Safe fallback to English and raw key; never raises KeyError or crashes.
"""
import json
from pathlib import Path
from typing import Dict, Any, Optional

_CATALOGS: Dict[str, Dict[str, Any]] = {}
DEFAULT_LANG = "en"
SUPPORTED_LANGUAGES = ["en", "ta", "hi"]

def load_catalogs() -> Dict[str, Dict[str, Any]]:
    global _CATALOGS
    if _CATALOGS:
        return _CATALOGS

    possible_dirs = [
        Path(__file__).resolve().parent.parent / "locales",
        Path(__file__).resolve().parent.parent.parent.parent / "locales",
        Path("locales"),
        Path("backend/app/locales")
    ]

    locales_dir = None
    for p in possible_dirs:
        if p.exists() and (p / "en.json").exists():
            locales_dir = p
            break

    for lang in SUPPORTED_LANGUAGES:
        cat = {}
        if locales_dir:
            file_path = locales_dir / f"{lang}.json"
            if file_path.exists():
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        cat = json.load(f)
                except Exception:
                    cat = {}
        _CATALOGS[lang] = cat

    return _CATALOGS

def _get_nested(catalog: dict, key: str) -> Optional[str]:
    parts = key.split(".")
    curr = catalog
    for p in parts:
        if isinstance(curr, dict) and p in curr:
            curr = curr[p]
        else:
            return None
    return curr if isinstance(curr, str) else None

class SafeDict(dict):
    """Prevents KeyError if parameter is missing during format_map"""
    def __missing__(self, key):
        return "{" + key + "}"

def t(key: str, lang: str = "en", **params) -> str:
    """
    Translate a key into target language with optional format params.
    Fallback hierarchy:
    1. Requested language (e.g. 'ta' or 'hi')
    2. English ('en')
    3. The key itself
    Never raises an exception on missing key or missing format parameters.
    """
    catalogs = load_catalogs()
    lang = (lang or DEFAULT_LANG).lower().strip()
    if lang not in SUPPORTED_LANGUAGES:
        lang = DEFAULT_LANG

    # 1. Lookup in requested language
    val = _get_nested(catalogs.get(lang, {}), key)

    # 2. Fallback to English if missing
    if val is None and lang != DEFAULT_LANG:
        val = _get_nested(catalogs.get(DEFAULT_LANG, {}), key)

    # 3. If still missing, return key itself
    if val is None:
        return key

    # 4. Safe interpolation
    if params:
        try:
            return val.format_map(SafeDict(params))
        except Exception:
            return val

    return val

def get_supported_languages():
    return [
        {"code": "en", "name": "English", "native": "English"},
        {"code": "ta", "name": "Tamil", "native": "தமிழ்"},
        {"code": "hi", "name": "Hindi", "native": "हिन्दी"}
    ]

