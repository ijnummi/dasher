import time
import logging
import httpx
from dasher.config import settings

logger = logging.getLogger(__name__)

_TOKEN_URL  = "https://oauth2.googleapis.com/token"
_LABELS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX"

_access_token: str | None = None
_token_expires_at: float  = 0.0


async def _get_access_token() -> str:
    global _access_token, _token_expires_at
    if _access_token and time.monotonic() < _token_expires_at:
        return _access_token
    async with httpx.AsyncClient() as client:
        r = await client.post(_TOKEN_URL, data={
            "client_id":     settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "refresh_token": settings.google_refresh_token,
            "grant_type":    "refresh_token",
        })
        r.raise_for_status()
        data = r.json()
    _access_token     = data["access_token"]
    _token_expires_at = time.monotonic() + data.get("expires_in", 3600) - 60
    return _access_token


async def get_unread_count() -> int:
    token = await _get_access_token()
    async with httpx.AsyncClient() as client:
        r = await client.get(_LABELS_URL,
                             headers={"Authorization": f"Bearer {token}"})
        r.raise_for_status()
    return r.json().get("messagesUnread", 0)
