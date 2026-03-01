import logging

import httpx
from fastapi import APIRouter, HTTPException

from dasher.config import settings
from dasher.http import log_response_error
from dasher.services import hass_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/hass", tags=["home-assistant"])


@router.get("/state/{entity_id:path}")
async def get_state(entity_id: str) -> dict:
    if not settings.hass_url or not settings.hass_token:
        return {"configured": False, "state": None, "attributes": {}}
    try:
        data = await hass_service.get_state(entity_id)
        return {
            "configured": True,
            "state":      data.get("state"),
            "attributes": data.get("attributes", {}),
        }
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            return {"configured": True, "state": None, "attributes": {},
                    "error": f"Entity '{entity_id}' not found"}
        log_response_error(exc)
        raise HTTPException(status_code=502, detail="Home Assistant error") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Home Assistant unreachable: {exc}") from exc
