from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and .env file.
    Fails fast on startup if any required environment variables are missing.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Supabase credentials
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Postgres connection string (direct connection)
    DATABASE_URL: str

    # Vercel AI Gateway settings
    AI_GATEWAY_URL: str
    AI_GATEWAY_API_KEY: Optional[str] = None

    # LLM & Embedding models
    LLM_MODEL: str = "openai/gpt-4o"
    EMBEDDING_MODEL: str = "openai/text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # CORS Allowed Origins (comma-separated string)
    ALLOWED_ORIGINS: str = ""

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: any) -> str:
        """
        Ensures the database URL uses the postgresql+psycopg scheme (psycopg 3)
        instead of postgresql or postgres to avoid driver mismatches in SQLAlchemy 2.
        """
        if isinstance(v, str):
            if v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+psycopg://", 1)
            elif v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg://", 1)
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """
        Parses the comma-separated ALLOWED_ORIGINS string into a list of strings.
        """
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()

