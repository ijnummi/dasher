import json
import uuid

import aiosqlite
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dasher.config import settings

router = APIRouter(prefix="/widgets", tags=["widgets"])


def _db_path() -> str:
    return settings.database_url.replace("sqlite+aiosqlite:///", "")


# --- Schemas ---

class WidgetConfig(BaseModel):
    widget_type: str
    config: dict = {}
    grid_x: int = 0
    grid_y: int = 0
    grid_w: int = 2
    grid_h: int = 2


class WidgetPositionUpdate(BaseModel):
    grid_x: int
    grid_y: int
    grid_w: int
    grid_h: int


# --- Endpoints ---

@router.get("/instances")
async def list_instances() -> dict:
    async with aiosqlite.connect(_db_path()) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, widget_type, config, grid_x, grid_y, grid_w, grid_h FROM widget_instances ORDER BY grid_y, grid_x"
        ) as cursor:
            rows = await cursor.fetchall()
    return {
        "widgets": [
            {
                "id": r["id"],
                "widget_type": r["widget_type"],
                "config": json.loads(r["config"]),
                "grid_x": r["grid_x"],
                "grid_y": r["grid_y"],
                "grid_w": r["grid_w"],
                "grid_h": r["grid_h"],
            }
            for r in rows
        ]
    }


@router.post("/instances", status_code=201)
async def create_instance(body: WidgetConfig) -> dict:
    widget_id = str(uuid.uuid4())
    async with aiosqlite.connect(_db_path()) as db:
        await db.execute(
            "INSERT INTO widget_instances (id, widget_type, config, grid_x, grid_y, grid_w, grid_h) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (widget_id, body.widget_type, json.dumps(body.config), body.grid_x, body.grid_y, body.grid_w, body.grid_h),
        )
        await db.commit()
    return {"id": widget_id}


@router.put("/instances/{widget_id}")
async def update_instance(widget_id: str, body: WidgetPositionUpdate) -> dict:
    async with aiosqlite.connect(_db_path()) as db:
        result = await db.execute(
            "UPDATE widget_instances SET grid_x=?, grid_y=?, grid_w=?, grid_h=? WHERE id=?",
            (body.grid_x, body.grid_y, body.grid_w, body.grid_h, widget_id),
        )
        await db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Widget not found")
    return {"ok": True}


@router.delete("/instances/{widget_id}", status_code=204)
async def delete_instance(widget_id: str) -> None:
    async with aiosqlite.connect(_db_path()) as db:
        await db.execute("DELETE FROM widget_instances WHERE id=?", (widget_id,))
        await db.commit()
