import asyncio
import logging

import httpx
from fastapi import APIRouter, HTTPException

from ..config import settings
from ..http import make_client, log_response_error

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/unifi", tags=["unifi"])

_SITE = "default"

# Cached cookies from last successful login — avoids re-logging in on every request
# (controller rate-limits login attempts).
_cookies: dict[str, str] = {}
_login_lock = asyncio.Lock()


async def _do_login(client: httpx.AsyncClient, base: str) -> None:
    global _cookies
    login = await client.post(
        f"{base}/api/auth/login",
        json={"username": settings.unifi_user, "password": settings.unifi_pass},
    )
    login.raise_for_status()
    _cookies = dict(client.cookies)
    logger.debug("UniFi login OK, session cached")


@router.get("/devices")
async def list_devices() -> dict:
    if not settings.unifi_url or not settings.unifi_user or not settings.unifi_pass:
        return {"configured": False, "devices": []}

    base = settings.unifi_url.rstrip("/")

    try:
        # verify=False: UniFi controllers commonly use self-signed TLS certs
        async with make_client(verify=False, timeout=10.0) as client:
            # Login on first call (no cached session yet)
            if not _cookies:
                async with _login_lock:
                    if not _cookies:
                        await _do_login(client, base)

            client.cookies.update(_cookies)
            resp = await client.get(f"{base}/proxy/network/api/s/{_SITE}/stat/sta")

            if resp.status_code == 401:
                # Session expired — re-login once, then retry
                async with _login_lock:
                    _cookies.clear()
                    await _do_login(client, base)
                resp = await client.get(f"{base}/proxy/network/api/s/{_SITE}/stat/sta")

            resp.raise_for_status()
            data = resp.json()

    except httpx.HTTPStatusError as exc:
        log_response_error(exc)
        raise HTTPException(status_code=502, detail=f"UniFi error: {exc}") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"UniFi unreachable: {exc}") from exc

    devices = []
    for c in data.get("data", []):
        name = c.get("hostname") or c.get("name") or c.get("mac", "unknown")
        devices.append({
            "mac": c.get("mac", ""),
            "name": name,
            "ip": c.get("ip"),
            "is_wired": c.get("is_wired", False),
            "online": True,
        })

    devices.sort(key=lambda d: d["name"].lower())
    return {"configured": True, "devices": devices}
