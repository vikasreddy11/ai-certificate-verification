import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CertiVerify AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://certiverify_user:certiverify_password@localhost:5432/certiverify_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "certiverify_super_secret_jwt_key_2026_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Asymmetric Key paths or hex seeds for Ed25519 signing
    ED25519_PRIVATE_KEY_HEX: str = os.getenv("ED25519_PRIVATE_KEY_HEX", "4b1f4a9b6c4e2a8f9c1b3d5e7f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        case_sensitive = True

settings = Settings()

