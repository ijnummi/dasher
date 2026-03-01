"""
Smoke test for GET /widgets/types.
"""
from httpx import AsyncClient
from dasher.routers.widgets import WIDGET_TYPES


async def test_list_types_returns_all(client: AsyncClient):
    r = await client.get("/widgets/types")
    assert r.status_code == 200
    body = r.json()
    assert "types" in body
    assert set(body["types"]) == set(WIDGET_TYPES)


async def test_list_types_is_not_empty(client: AsyncClient):
    r = await client.get("/widgets/types")
    assert len(r.json()["types"]) > 0
