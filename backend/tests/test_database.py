"""
Tests for database.py: init_db() creates tables and seeds rows idempotently.
"""
import os

import aiosqlite
import pytest

from dasher.config import settings
from dasher.database import init_db


async def _table_names(db_path: str) -> set[str]:
    async with aiosqlite.connect(db_path) as db:
        async with db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ) as cur:
            rows = await cur.fetchall()
    return {r[0] for r in rows}


async def _count(db_path: str, table: str) -> int:
    async with aiosqlite.connect(db_path) as db:
        async with db.execute(f"SELECT COUNT(*) FROM {table}") as cur:
            row = await cur.fetchone()
    return row[0]


# ── Table creation ─────────────────────────────────────────────────────────────

async def test_init_db_creates_all_tables(tmp_path, monkeypatch):
    db_file = tmp_path / "test.db"
    monkeypatch.setattr(settings, "database_url", f"sqlite+aiosqlite:///{db_file}")

    await init_db()

    tables = await _table_names(str(db_file))
    assert {"widget_instances", "rss_feeds", "crawler_rules", "crawler_alerts", "settings"} <= tables


# ── Seed rows ──────────────────────────────────────────────────────────────────

async def test_init_db_seeds_widget_instances(tmp_path, monkeypatch):
    db_file = tmp_path / "test.db"
    monkeypatch.setattr(settings, "database_url", f"sqlite+aiosqlite:///{db_file}")

    await init_db()

    count = await _count(str(db_file), "widget_instances")
    assert count == 11  # 11 seed rows defined in database.py


# ── Idempotency ────────────────────────────────────────────────────────────────

async def test_init_db_idempotent(tmp_path, monkeypatch):
    """Calling init_db() twice must not raise and must not duplicate seed rows."""
    db_file = tmp_path / "test.db"
    monkeypatch.setattr(settings, "database_url", f"sqlite+aiosqlite:///{db_file}")

    await init_db()
    await init_db()

    count = await _count(str(db_file), "widget_instances")
    assert count == 11
