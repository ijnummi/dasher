import httpx
from dasher.config import settings


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.hass_token}"}


async def get_state(entity_id: str) -> dict:
    url = f"{settings.hass_url.rstrip('/')}/api/states/{entity_id}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, headers=_headers())
        r.raise_for_status()
        return r.json()
