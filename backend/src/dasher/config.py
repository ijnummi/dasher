from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./data/dasher.db"
    secret_key: str = "changeme"

    hass_url: str = ""
    hass_token: str = ""

    sabnzbd_url: str = ""
    sabnzbd_api_key: str = ""

    unifi_url: str = ""
    unifi_user: str = ""
    unifi_pass: str = ""

    ollama_url: str = "http://host.docker.internal:11434"


settings = Settings()
