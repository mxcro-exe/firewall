import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "PatchShield"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = "patchshield-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DATA_DIR / 'patchshield.db'}"
    
    # Gateway Defaults
    DEFAULT_SECURITY_MODE: str = "PROTECT"  # MONITOR | PROTECT | STRICT
    AUTO_ROLLBACK_FP_THRESHOLD: float = 0.05  # Rollback if FP rate > 5%
    
    # Notifications
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "alerts@patchshield.local"
    WEBHOOK_URL: str = ""
    
    # Offline Vulnerability Intel
    NVD_CACHE_PATH: str = str(DATA_DIR / "nvd_cache.json")
    CISA_KEV_CACHE_PATH: str = str(DATA_DIR / "cisa_kev_cache.json")
    EPSS_CACHE_PATH: str = str(DATA_DIR / "epss_cache.json")
    
    # ML Models
    ML_MODEL_PATH: str = str(DATA_DIR / "models" / "model.pkl")
    ISO_MODEL_PATH: str = str(DATA_DIR / "models" / "iso_model.pkl")

settings = Settings()
