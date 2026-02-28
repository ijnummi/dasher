from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from dasher.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


DDL = """
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


async def init_db() -> None:
    import aiosqlite

    # Extract file path from URL: sqlite+aiosqlite:///./data/dasher.db → ./data/dasher.db
    db_path = settings.database_url.replace("sqlite+aiosqlite:///", "")
    import os
    os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)

    async with aiosqlite.connect(db_path) as db:
        for statement in DDL.strip().split(";"):
            stmt = statement.strip()
            if stmt:
                await db.execute(stmt)
        await db.commit()

        # Seed a dummy widget if the dashboard is empty
        import json
        import uuid
        async with db.execute("SELECT COUNT(*) FROM widget_instances") as cursor:
            (count,) = await cursor.fetchone()
        if count == 0:
            await db.execute(
                "INSERT INTO widget_instances (id, widget_type, config, grid_x, grid_y, grid_w, grid_h) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), "dummy", json.dumps({"nimi": "Dasher"}), 0, 0, 3, 2),
            )
            await db.commit()
