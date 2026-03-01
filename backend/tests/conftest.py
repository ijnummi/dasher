"""
Shared fixtures for the Dasher backend test suite.

SECRET_KEY must be set before any dasher module is imported, because
config.py raises RuntimeError at module load time if it equals "changeme".
"""
import os
import tempfile

# Must be set before the first `import dasher.*`
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest")

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from dasher.config import settings
from dasher.database import init_db
from dasher.main import app


@pytest_asyncio.fixture
async def client(tmp_path, monkeypatch):
    """
    Yields an AsyncClient backed by the FastAPI app, pointed at a fresh
    temporary SQLite database for each test.
    """
    db_file = tmp_path / "test.db"
    test_url = f"sqlite+aiosqlite:///{db_file}"
    monkeypatch.setattr(settings, "database_url", test_url)

    await init_db()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
