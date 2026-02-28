from fastapi import APIRouter

router = APIRouter(prefix="/rss", tags=["rss"])


@router.get("/feeds")
async def list_feeds() -> dict:
    return {"feeds": []}
