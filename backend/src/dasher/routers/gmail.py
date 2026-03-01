import logging
from fastapi import APIRouter, HTTPException
from dasher.config import settings
from dasher.services import gmail_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/gmail", tags=["gmail"])


@router.get("/unread")
async def get_unread() -> dict:
    if not settings.google_client_id or not settings.google_refresh_token:
        raise HTTPException(status_code=503, detail="Gmail not configured")
    try:
        count = await gmail_service.get_unread_count()
        return {"unread": count}
    except Exception as exc:
        logger.exception("Gmail API error")
        raise HTTPException(status_code=502, detail="Gmail API error") from exc


@router.get("/inbox")
async def get_inbox() -> dict:
    if not settings.google_client_id or not settings.google_refresh_token:
        return {"configured": False, "messages": []}
    try:
        messages = await gmail_service.get_inbox_messages(limit=5)
        return {"configured": True, "messages": messages}
    except Exception as exc:
        logger.exception("Gmail inbox error")
        raise HTTPException(status_code=502, detail="Gmail API error") from exc
