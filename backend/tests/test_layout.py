"""
Tests for the layout router: GET/POST/PATCH/DELETE /widgets/instances
"""
import pytest
from httpx import AsyncClient


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _create(client: AsyncClient, **kwargs) -> str:
    """Create a widget instance and return its ID."""
    payload = {"widget_type": "clock", **kwargs}
    r = await client.post("/widgets/instances", json=payload)
    assert r.status_code == 201, r.text
    return r.json()["id"]


# ── List ───────────────────────────────────────────────────────────────────────

async def test_list_returns_seed_widgets(client: AsyncClient):
    r = await client.get("/widgets/instances")
    assert r.status_code == 200
    body = r.json()
    assert "widgets" in body
    # database.py seeds 11 widget instances
    assert len(body["widgets"]) == 11


async def test_list_shape(client: AsyncClient):
    r = await client.get("/widgets/instances")
    w = r.json()["widgets"][0]
    for key in ("id", "widget_type", "name", "config", "grid_x", "grid_y", "grid_w", "grid_h", "background_color"):
        assert key in w, f"Missing key: {key}"


# ── Create ─────────────────────────────────────────────────────────────────────

async def test_create_minimal(client: AsyncClient):
    r = await client.post("/widgets/instances", json={"widget_type": "clock"})
    assert r.status_code == 201
    body = r.json()
    assert "id" in body
    assert len(body["id"]) == 36  # UUID


async def test_create_full(client: AsyncClient):
    r = await client.post("/widgets/instances", json={
        "widget_type": "rss",
        "name": "My RSS",
        "config": {"feed_url": "http://example.com/feed"},
        "grid_x": 2, "grid_y": 3, "grid_w": 4, "grid_h": 2,
        "background_color": "#123456",
    })
    assert r.status_code == 201
    widget_id = r.json()["id"]

    # Verify it appears in the list
    instances = (await client.get("/widgets/instances")).json()["widgets"]
    match = next((w for w in instances if w["id"] == widget_id), None)
    assert match is not None
    assert match["name"] == "My RSS"
    assert match["grid_x"] == 2
    assert match["background_color"] == "#123456"


async def test_create_bad_widget_type_returns_422(client: AsyncClient):
    r = await client.post("/widgets/instances", json={"widget_type": "nonexistent"})
    assert r.status_code == 422


async def test_create_invalid_grid_w_returns_422(client: AsyncClient):
    r = await client.post("/widgets/instances", json={"widget_type": "clock", "grid_w": 0})
    assert r.status_code == 422


async def test_create_grid_w_too_large_returns_422(client: AsyncClient):
    r = await client.post("/widgets/instances", json={"widget_type": "clock", "grid_w": 13})
    assert r.status_code == 422


# ── Patch position ─────────────────────────────────────────────────────────────

async def test_patch_position(client: AsyncClient):
    widget_id = await _create(client, grid_x=0, grid_y=0, grid_w=2, grid_h=2)
    r = await client.patch(f"/widgets/instances/{widget_id}", json={
        "grid_x": 5, "grid_y": 6, "grid_w": 3, "grid_h": 4,
    })
    assert r.status_code == 200
    assert r.json() == {"ok": True}

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    w = next(w for w in instances if w["id"] == widget_id)
    assert w["grid_x"] == 5
    assert w["grid_y"] == 6
    assert w["grid_w"] == 3
    assert w["grid_h"] == 4


async def test_patch_position_with_name(client: AsyncClient):
    widget_id = await _create(client)
    r = await client.patch(f"/widgets/instances/{widget_id}", json={
        "grid_x": 1, "grid_y": 1, "grid_w": 2, "grid_h": 2, "name": "Updated",
    })
    assert r.status_code == 200

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    w = next(w for w in instances if w["id"] == widget_id)
    assert w["name"] == "Updated"


async def test_patch_position_not_found(client: AsyncClient):
    r = await client.patch("/widgets/instances/no-such-id", json={
        "grid_x": 0, "grid_y": 0, "grid_w": 2, "grid_h": 2,
    })
    assert r.status_code == 404


# ── Patch name ─────────────────────────────────────────────────────────────────

async def test_patch_name(client: AsyncClient):
    widget_id = await _create(client, name="Before")
    r = await client.patch(f"/widgets/instances/{widget_id}/name", json={"name": "After"})
    assert r.status_code == 200

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    w = next(w for w in instances if w["id"] == widget_id)
    assert w["name"] == "After"


async def test_patch_name_not_found(client: AsyncClient):
    r = await client.patch("/widgets/instances/no-such-id/name", json={"name": "X"})
    assert r.status_code == 404


# ── Patch color ────────────────────────────────────────────────────────────────

async def test_patch_color_set(client: AsyncClient):
    widget_id = await _create(client)
    r = await client.patch(f"/widgets/instances/{widget_id}/color", json={"background_color": "#abcdef"})
    assert r.status_code == 200

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    w = next(w for w in instances if w["id"] == widget_id)
    assert w["background_color"] == "#abcdef"


async def test_patch_color_clear(client: AsyncClient):
    widget_id = await _create(client, background_color="#ff0000")
    r = await client.patch(f"/widgets/instances/{widget_id}/color", json={"background_color": None})
    assert r.status_code == 200

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    w = next(w for w in instances if w["id"] == widget_id)
    assert w["background_color"] is None


async def test_patch_color_not_found(client: AsyncClient):
    r = await client.patch("/widgets/instances/no-such-id/color", json={"background_color": "#ff0000"})
    assert r.status_code == 404


# ── Delete ─────────────────────────────────────────────────────────────────────

async def test_delete(client: AsyncClient):
    widget_id = await _create(client)
    r = await client.delete(f"/widgets/instances/{widget_id}")
    assert r.status_code == 204

    instances = (await client.get("/widgets/instances")).json()["widgets"]
    assert not any(w["id"] == widget_id for w in instances)


async def test_delete_idempotent(client: AsyncClient):
    """Deleting a non-existent widget still returns 204 (no body expected)."""
    r = await client.delete("/widgets/instances/no-such-id")
    assert r.status_code == 204
