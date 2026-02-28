from fastapi import APIRouter

router = APIRouter(prefix="/sabnzbd", tags=["sabnzbd"])


@router.get("/queue")
async def get_queue() -> dict:
    return {"queue": {}}
