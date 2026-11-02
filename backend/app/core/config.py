from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://moodify:moodify@localhost:5432/moodify"
    redis_url: str = "redis://localhost:6379/0"
    # Where this API is reachable from the client — used to build preview_url
    # for the local demo catalog (scripts/download_demo_tracks.py). Match this
    # to app/.env's EXPO_PUBLIC_API_BASE_URL host (e.g. 10.0.2.2 for Android
    # emulator, a LAN IP for a physical device).
    # On Render, falls back to the auto-injected RENDER_EXTERNAL_URL.
    public_base_url: str = Field(
        default="http://localhost:8000",
        validation_alias=AliasChoices("PUBLIC_BASE_URL", "RENDER_EXTERNAL_URL"),
    )
    # Dimensionality of Track.embedding (pgvector). Placeholder until FR-03's
    # embedding model is chosen — changing this requires a new migration.
    embedding_dim: int = 32

    # FR-05 auth. Override in .env — this default is for local dev only.
    jwt_secret_key: str = "dev-insecure-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days; no refresh-token flow in Phase 1


settings = Settings()
