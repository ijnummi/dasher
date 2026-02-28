import json
import logging
import os
import uuid

import aiosqlite
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from dasher.config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(settings.database_url, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


def db_path() -> str:
    return settings.database_url.replace("sqlite+aiosqlite:///", "")


DDL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS widget_instances (
    id TEXT PRIMARY KEY,
    widget_type TEXT NOT NULL,
    config JSON NOT NULL DEFAULT '{}',
    grid_x INT DEFAULT 0,
    grid_y INT DEFAULT 0,
    grid_w INT DEFAULT 2,
    grid_h INT DEFAULT 2,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rss_feeds (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    label TEXT,
    refresh_interval_minutes INT DEFAULT 15
);

CREATE TABLE IF NOT EXISTS crawler_rules (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    selector TEXT,
    llm_prompt TEXT,
    check_interval_minutes INT DEFAULT 60
);

CREATE TABLE IF NOT EXISTS crawler_alerts (
    id TEXT PRIMARY KEY,
    rule_id TEXT REFERENCES crawler_rules(id),
    content_snapshot TEXT,
    llm_analysis TEXT,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    dismissed BOOL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

# Fixed UUIDs for seed rows so INSERT OR IGNORE is idempotent
_SEED_DUMMY_ID = "00000000-0000-0000-0000-000000000001"
_SEED_TECH_ID = "00000000-0000-0000-0000-000000000002"


async def init_db() -> None:
    path = db_path()
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)

    try:
        async with aiosqlite.connect(path) as db:
            for statement in DDL.strip().split(";"):
                stmt = statement.strip()
                if stmt:
                    await db.execute(stmt)
            await db.commit()

            await db.executemany(
                "INSERT OR IGNORE INTO widget_instances (id, widget_type, config, grid_x, grid_y, grid_w, grid_h) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    (_SEED_DUMMY_ID, "dummy",      json.dumps({"nimi": "Dasher"}), 0, 0, 3, 2),
                    (_SEED_TECH_ID,  "tech_about", json.dumps({}),                 3, 0, 9, 6),
                ],
            )
            await db.commit()
    except Exception:
        logger.exception("Failed to initialise database at %s", path)
        raise
