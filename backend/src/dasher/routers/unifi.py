from urllib.parse import urlparse

import aiohttp
import aiounifi
from aiounifi.models.configuration import Configuration
from fastapi import APIRouter, HTTPException

from ..config import settings

router = APIRouter(prefix="/unifi", tags=["unifi"])

_SITE = "default"


@router.get("/devices")
async def list_devices() -> dict:
    if not settings.unifi_url or not settings.unifi_user or not settings.unifi_pass:
        return {"configured": False, "devices": []}

    parsed = urlparse(settings.unifi_url)
    host = parsed.hostname or settings.unifi_url
    port = parsed.port or 8443

    try:
        # CookieJar(unsafe=True) is required when the host is an IP address
        async with aiohttp.ClientSession(
            cookie_jar=aiohttp.CookieJar(unsafe=True)
        ) as session:
            config = Configuration(
                session=session,
                host=host,
                username=settings.unifi_user,
                password=settings.unifi_pass,
                port=port,
                site=_SITE,
                ssl_context=False,  # allow self-signed TLS certs
            )
            controller = aiounifi.Controller(config)
            await controller.login()
            await controller.clients.update()

            devices = []
            for client in controller.clients.values():
                name = client.hostname or client.name or client.mac
                devices.append({
                    "mac": client.mac,
                    "name": name,
                    "ip": client.ip,
                    "is_wired": client.is_wired,
                    "online": True,  # clients.update() only returns connected clients
                })

    except aiounifi.Unauthorized as exc:
        raise HTTPException(status_code=502, detail="UniFi authentication failed") from exc
    except (aiounifi.RequestError, aiounifi.AiounifiException) as exc:
        raise HTTPException(status_code=502, detail=f"UniFi unreachable: {exc}") from exc

    devices.sort(key=lambda d: d["name"].lower())
    return {"configured": True, "devices": devices}
