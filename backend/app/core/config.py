import os
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CertiVerify AI"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://certiverify_user:certiverify_password@localhost:5432/certiverify_db",
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    # 64 hex chars (32 bytes). MUST be set as an env var on Render, otherwise
    # app/core/security.py generates a random key on every restart and every
    # stored signature becomes invalid.
    ED25519_PRIVATE_KEY_HEX: str = os.getenv("ED25519_PRIVATE_KEY_HEX", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    @field_validator("DATABASE_URL")
    @classmethod
    def fix_db_url(cls, v: str) -> str:
        # SQLite support for local dev/testing
        if v.startswith("sqlite"):
            return v
        # Render gives postgres://... or postgresql://...; asyncpg needs the +asyncpg driver
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        # asyncpg doesn't understand sslmode=, it uses ssl=
        return v.replace("sslmode=", "ssl=")

    model_config = {"case_sensitive": True, "env_file": [".env", "../.env"], "extra": "ignore"}


settings = Settings()
