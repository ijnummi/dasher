from fastapi import APIRouter, HTTPException
import httpx

from ..config import settings
from ..http import make_client, log_response_error

router = APIRouter(prefix="/sabnzbd", tags=["sabnzbd"])


@router.get("/queue")
async def get_queue() -> dict:
    if not settings.sabnzbd_url or not settings.sabnzbd_api_key:
        return {"configured": False, "slots": []}

    url = f"{settings.sabnzbd_url.rstrip('/')}/api"
    params = {
        "mode": "queue",
        "output": "json",
        "apikey": settings.sabnzbd_api_key,
        "start": 0,
        "limit": 5,
    }

    try:
        async with make_client(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPStatusError as exc:
        log_response_error(exc)
        raise HTTPException(status_code=502, detail=f"SABnzbd error: {exc}") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"SABnzbd unreachable: {exc}") from exc

    queue = data.get("queue", {})
    slots = [
        {
            "id": s.get("nzo_id"),
            "filename": s.get("filename"),
            "status": s.get("status"),
            "mb": s.get("mb"),
            "mbleft": s.get("mbleft"),
            "percentage": s.get("percentage"),
            "timeleft": s.get("timeleft"),
            "cat": s.get("cat"),
        }
        for s in queue.get("slots", [])
    ]

    return {
        "configured": True,
        "slots": slots,
        "speed": queue.get("speed", ""),
        "sizeleft": queue.get("sizeleft", ""),
        "timeleft": queue.get("timeleft", ""),
        "noofslots": queue.get("noofslots_total", 0),
        "paused": queue.get("paused", False),
    }
