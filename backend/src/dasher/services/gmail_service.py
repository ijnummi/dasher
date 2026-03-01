import asyncio
import time
import logging
import httpx
from dasher.config import settings

logger = logging.getLogger(__name__)

_TOKEN_URL    = "https://oauth2.googleapis.com/token"
_LABELS_URL   = "https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX"
_MESSAGES_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages"

_access_token: str | None = None
_token_expires_at: float  = 0.0
_refresh_lock = asyncio.Lock()


async def _get_access_token() -> str:
    global _access_token, _token_expires_at
    async with _refresh_lock:
        if _access_token and time.monotonic() < _token_expires_at:
            return _access_token
        async with httpx.AsyncClient(timeout=10.0) as client:
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
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(_LABELS_URL,
                             headers={"Authorization": f"Bearer {token}"})
        r.raise_for_status()
    return r.json().get("messagesUnread", 0)


async def get_inbox_messages(limit: int = 5) -> list[dict]:
    token = await _get_access_token()
    auth = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Fetch the list of message IDs from inbox
        r = await client.get(
            _MESSAGES_URL,
            headers=auth,
            params={"labelIds": "INBOX", "maxResults": limit},
        )
        r.raise_for_status()
        ids = [m["id"] for m in r.json().get("messages", [])]

        # Fetch metadata for each message in parallel
        async def fetch_meta(msg_id: str) -> dict:
            resp = await client.get(
                f"{_MESSAGES_URL}/{msg_id}",
                headers=auth,
                params={
                    "format": "metadata",
                    "metadataHeaders": ["Subject", "From", "Date"],
                },
            )
            resp.raise_for_status()
            return resp.json()

        metas = await asyncio.gather(*[fetch_meta(i) for i in ids])

    result = []
    for msg in metas:
        header_map = {
            h["name"]: h["value"]
            for h in msg.get("payload", {}).get("headers", [])
        }
        result.append({
            "id":      msg["id"],
            "subject": header_map.get("Subject", "(no subject)"),
            "from":    header_map.get("From", ""),
            "date":    header_map.get("Date", ""),
            "unread":  "UNREAD" in msg.get("labelIds", []),
        })
    return result
