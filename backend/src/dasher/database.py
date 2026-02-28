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

# Fixed UUIDs for seed rows so INSERT OR IGNORE is idempotent across restarts
_SEED_DUMMY_ID         = "00000000-0000-0000-0000-000000000001"
_SEED_TECH_ID          = "00000000-0000-0000-0000-000000000002"
_SEED_CLOCK_ID         = "00000000-0000-0000-0000-000000000003"
_SEED_GMAIL_ID         = "00000000-0000-0000-0000-000000000004"
_SEED_RSS_ID           = "00000000-0000-0000-0000-000000000005"
_SEED_HASS_ID          = "00000000-0000-0000-0000-000000000006"
_SEED_SABNZBD_ID       = "00000000-0000-0000-0000-000000000007"
_SEED_UNIFI_ID         = "00000000-0000-0000-0000-000000000008"
_SEED_HTML_ID          = "00000000-0000-0000-0000-000000000009"
_SEED_CRAWLER_ALERT_ID = "00000000-0000-0000-0000-000000000010"


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

            # fmt: off
            await db.executemany(
                "INSERT OR IGNORE INTO widget_instances (id, widget_type, config, grid_x, grid_y, grid_w, grid_h) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    # Row 0 — y=0
                    (_SEED_DUMMY_ID,         "dummy",          json.dumps({"nimi": "Dasher"}), 0, 0,  3, 2),
                    (_SEED_TECH_ID,          "tech_about",     json.dumps({}),                 3, 0,  9, 6),
                    # Row 1 — y=6 (four equal-ish columns across 12)
                    (_SEED_CLOCK_ID,         "clock",          json.dumps({}),                 0, 6,  2, 2),
                    (_SEED_GMAIL_ID,         "gmail",          json.dumps({}),                 2, 6,  2, 2),
                    (_SEED_RSS_ID,           "rss",            json.dumps({}),                 4, 6,  4, 2),
                    (_SEED_HASS_ID,          "hass",           json.dumps({}),                 8, 6,  4, 2),
                    # Row 2 — y=8 (four equal columns)
                    (_SEED_SABNZBD_ID,       "sabnzbd",        json.dumps({}),                 0, 8,  3, 2),
                    (_SEED_UNIFI_ID,         "unifi",          json.dumps({}),                 3, 8,  3, 2),
                    (_SEED_HTML_ID,          "html",           json.dumps({}),                 6, 8,  3, 2),
                    (_SEED_CRAWLER_ALERT_ID, "crawler_alert",  json.dumps({}),                 9, 8,  3, 2),
                ],
            )
            # fmt: on
            await db.commit()
    except Exception:
        logger.exception("Failed to initialise database at %s", path)
        raise
