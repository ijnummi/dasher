from fastapi import APIRouter

router = APIRouter(prefix="/unifi", tags=["unifi"])


@router.get("/devices")
async def list_devices() -> dict:
    return {"devices": []}
