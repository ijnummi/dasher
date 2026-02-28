import json
import uuid
from typing import Literal

import aiosqlite
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from dasher.database import db_path

router = APIRouter(prefix="/widgets", tags=["widgets"])

WIDGET_TYPES = Literal[
    "clock", "gmail", "rss", "hass", "sabnzbd", "unifi",
    "html", "crawler_alert", "dummy", "tech_about",
]


# --- Schemas ---

class WidgetConfig(BaseModel):
    widget_type: WIDGET_TYPES
    name: str = ""
    config: dict = {}
    grid_x: int = Field(default=0, ge=0)
    grid_y: int = Field(default=0, ge=0)
    grid_w: int = Field(default=2, ge=1, le=12)
    grid_h: int = Field(default=2, ge=1)
    background_color: str | None = None


class WidgetPositionUpdate(BaseModel):
    grid_x: int = Field(ge=0)
    grid_y: int = Field(ge=0)
    grid_w: int = Field(ge=1, le=12)
    grid_h: int = Field(ge=1)
    name: str | None = None


class WidgetColorUpdate(BaseModel):
    background_color: str | None  # None clears the stored color (reverts to auto)


# --- Endpoints ---

@router.get("/instances")
async def list_instances() -> dict:
    async with aiosqlite.connect(db_path()) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT id, widget_type, name, config, grid_x, grid_y, grid_w, grid_h, background_color"
            " FROM widget_instances ORDER BY grid_y, grid_x"
        ) as cursor:
            rows = await cursor.fetchall()
    return {
        "widgets": [
            {
                "id": r["id"],
                "widget_type": r["widget_type"],
                "name": r["name"],
                "config": json.loads(r["config"]),
                "grid_x": r["grid_x"],
                "grid_y": r["grid_y"],
                "grid_w": r["grid_w"],
                "grid_h": r["grid_h"],
                "background_color": r["background_color"],
            }
            for r in rows
        ]
    }


@router.post("/instances", status_code=201)
async def create_instance(body: WidgetConfig) -> dict:
    widget_id = str(uuid.uuid4())
    async with aiosqlite.connect(db_path()) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute(
            "INSERT INTO widget_instances"
            " (id, widget_type, name, config, grid_x, grid_y, grid_w, grid_h, background_color)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                widget_id, body.widget_type, body.name, json.dumps(body.config),
                body.grid_x, body.grid_y, body.grid_w, body.grid_h, body.background_color,
            ),
        )
        await db.commit()
    return {"id": widget_id}


@router.patch("/instances/{widget_id}")
async def update_instance(widget_id: str, body: WidgetPositionUpdate) -> dict:
    async with aiosqlite.connect(db_path()) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        if body.name is not None:
            result = await db.execute(
                "UPDATE widget_instances SET grid_x=?, grid_y=?, grid_w=?, grid_h=?, name=? WHERE id=?",
                (body.grid_x, body.grid_y, body.grid_w, body.grid_h, body.name, widget_id),
            )
        else:
            result = await db.execute(
                "UPDATE widget_instances SET grid_x=?, grid_y=?, grid_w=?, grid_h=? WHERE id=?",
                (body.grid_x, body.grid_y, body.grid_w, body.grid_h, widget_id),
            )
        await db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Widget not found")
    return {"ok": True}


@router.patch("/instances/{widget_id}/color")
async def update_instance_color(widget_id: str, body: WidgetColorUpdate) -> dict:
    async with aiosqlite.connect(db_path()) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        result = await db.execute(
            "UPDATE widget_instances SET background_color=? WHERE id=?",
            (body.background_color, widget_id),
        )
        await db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Widget not found")
    return {"ok": True}


@router.delete("/instances/{widget_id}", status_code=204)
async def delete_instance(widget_id: str) -> None:
    async with aiosqlite.connect(db_path()) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute("DELETE FROM widget_instances WHERE id=?", (widget_id,))
        await db.commit()
