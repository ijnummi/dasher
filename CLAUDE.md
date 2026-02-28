# Dasher — Claude Code Guide

## Project overview

Customizable TV/desktop info dashboard. Widget-based, drag-and-drop layout editing.
Integrations: Home Assistant, RSS, SABnzbd, Unifi, Ollama (local LLM for web crawlers).

Two React frontends: a stable dashboard and a cutting-edge admin app.

## Architecture

```
Browser ──► nginx :80 ──► /api/*       → FastAPI backend :8000
                      └──► /dashboard/* → dashboard React app :80
                      └──► /admin/*     → admin React app :80
```

Docker Compose runs all services. Single `.env` file for all secrets.

## Key decisions

### Nginx sub-path routing
Both React apps are served under sub-paths (`/dashboard/`, `/admin/`), not at the root.
**Both Vite configs must set `base: '/dashboard/'` and `base: '/admin/'` respectively.**
Without this, built assets are referenced as `/assets/...` which nginx has no route for.

### APScheduler version
Use `apscheduler>=3.10` (stable). Version 4.x is still alpha (`4.0.0a6` only) — not suitable.
The 3.x async API is used for background jobs.

### Backend install in Docker
`COPY src/` must happen **before** `RUN uv pip install --system .` in the Dockerfile.
Do not use editable install (`-e`) in the production container — just `uv pip install --system .`.

### ESM-only packages (Tailwind v4 / @tailwindcss/vite)
Both frontend `package.json` files must include `"type": "module"`.
Without it, Vite's config loader uses `require()` and can't load ESM-only plugins.

### TypeScript + CSS imports
Both frontend `src/` directories need `vite-env.d.ts` with `/// <reference types="vite/client" />`.
This provides type declarations for CSS module imports and `import.meta.env`.

## Tech stack

| Layer | Tech |
|---|---|
| Backend framework | FastAPI (async) |
| Backend package manager | uv |
| Backend settings | pydantic-settings |
| Database | SQLite via aiosqlite + SQLAlchemy 2 async |
| HTTP client | httpx (async) |
| Web scraping | BeautifulSoup4 + httpx |
| RSS | feedparser |
| LLM | Ollama via httpx (`/api/generate`) |
| Background jobs | APScheduler 3.x |
| Dashboard build | Vite 5 |
| Dashboard framework | React 18 |
| Dashboard grid | react-grid-layout |
| Dashboard state | Zustand |
| Admin build | Vite 6 |
| Admin framework | React 19 |
| Admin routing | TanStack Router v1 |
| Admin state | Jotai |
| Shared data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |

## Directory structure

```
dasher/
├── backend/src/dasher/
│   ├── main.py          # FastAPI app, lifespan, all routers registered here
│   ├── config.py        # pydantic-settings — all env vars
│   ├── database.py      # aiosqlite init_db(), DDL for all tables
│   ├── ws_manager.py    # WebSocket channel subscription manager
│   ├── models/          # SQLAlchemy models (layout.py, crawler.py)
│   ├── routers/         # One file per domain (layout, widgets, rss, hass, ...)
│   └── services/        # Business logic (rss_service, hass_service, ...)
├── frontend/dashboard/  # React 18 + Vite 5, base: '/dashboard/'
├── frontend/admin/      # React 19 + Vite 6, base: '/admin/'
└── nginx/nginx.conf     # Proxy rules
```

## Database tables

All tables created on startup in `database.py` via raw DDL (no Alembic migrations yet):
- `widget_instances` — widget type, config JSON, grid position
- `rss_feeds` — feed URL, label, refresh interval
- `crawler_rules` — URL, CSS selector, LLM prompt, check interval
- `crawler_alerts` — crawler results + LLM analysis, dismiss state
- `settings` — key/value store for integration URLs and tokens

## WebSocket protocol

```jsonc
// Client → Server
{ "action": "subscribe", "channels": ["rss:feed-id", "hass:sensor.temp", "alerts"] }

// Server → Client
{ "channel": "rss:feed-id", "type": "update", "data": { "items": [...] } }
```

## Development

```bash
cp .env.example .env   # fill in values
docker compose up --build
```

- `http://localhost/dashboard` — dashboard app
- `http://localhost/admin` — admin app
- `http://localhost/api/docs` — FastAPI OpenAPI UI

Hot-reload dev mode: `docker compose -f docker-compose.dev.yml up`
