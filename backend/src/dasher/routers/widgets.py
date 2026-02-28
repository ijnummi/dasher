from fastapi import APIRouter

router = APIRouter(prefix="/widgets", tags=["widgets"])

WIDGET_TYPES = ["clock", "dummy", "tech_about", "rss", "hass", "sabnzbd", "unifi", "html", "crawler_alert", "gmail"]


@router.get("/types")
async def list_widget_types() -> dict:
    return {"types": WIDGET_TYPES}
