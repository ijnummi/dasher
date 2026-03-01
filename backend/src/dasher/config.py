import logging

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./data/dasher.db"
    secret_key: str = "changeme"

    # Comma-separated origins for CORS, e.g. "http://localhost,http://localhost:80"
    cors_origins: list[str] = ["http://localhost", "http://localhost:80"]

    hass_url: str = ""
    hass_token: str = ""

    sabnzbd_url: str = ""
    sabnzbd_api_key: str = ""

    unifi_url: str = ""
    unifi_user: str = ""
    unifi_pass: str = ""

    ollama_url: str = "http://host.docker.internal:11434"

    google_client_id:     str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""


settings = Settings()

if settings.secret_key == "changeme":
    raise RuntimeError(
        "SECRET_KEY is set to the insecure default 'changeme'. "
        "Set a real secret in your .env file before starting the app."
    )
