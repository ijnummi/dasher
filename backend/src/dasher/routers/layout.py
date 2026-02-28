from fastapi import APIRouter

router = APIRouter(prefix="/layouts", tags=["layout"])


@router.get("/")
async def list_layouts() -> dict:
    return {"layouts": []}
