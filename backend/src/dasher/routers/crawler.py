from fastapi import APIRouter

router = APIRouter(prefix="/crawler", tags=["crawler"])


@router.get("/rules")
async def list_rules() -> dict:
    return {"rules": []}


@router.get("/alerts")
async def list_alerts() -> dict:
    return {"alerts": []}
