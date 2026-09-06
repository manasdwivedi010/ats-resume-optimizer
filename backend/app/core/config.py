import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Role-Based ATS Resume Optimizer"
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ats_optimizer")
    
    # Auth & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-ats-jwt-token-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    OTP_EXPIRE_MINUTES: int = 5
    
    # Email / OTP Settings
    # When OTP_DEV_MODE is True, the code is also logged to console for easy testing.
    # To disable auto-fill in UI once Gmail is linked, set OTP_DEV_MODE=false in .env.
    OTP_DEV_MODE: bool = os.getenv("OTP_DEV_MODE", "false").lower() in ("true", "1", "yes")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "")

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
