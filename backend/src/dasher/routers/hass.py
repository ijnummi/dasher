from fastapi import APIRouter

router = APIRouter(prefix="/hass", tags=["home-assistant"])


@router.get("/states")
async def list_states() -> dict:
    return {"states": []}
