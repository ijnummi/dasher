# Dasher

Customizable TV/desktop info dashboard. Widget-based layout with drag-and-drop editing.

Integrations: Home Assistant, RSS feeds, SABnzbd, Unifi, Ollama (local LLM).

## Architecture

```
Browser ──► nginx :80 ──► /api/*        → FastAPI backend  :8000
                      ├──► /dashboard/* → Dashboard React app
                      └──► /admin/*     → Admin React app
```

## Quick start

```bash
cp .env.example .env   # fill in your secrets / integration URLs
docker compose up --build
```

| URL | What |
|-----|------|
| `http://localhost/dashboard` | Dashboard (TV display) |
| `http://localhost/admin` | Admin (layout editor, settings) |
| `http://localhost/api/docs` | FastAPI OpenAPI UI |

## Development (hot-reload)

Run the full stack with file-watching:

```bash
docker compose -f docker-compose.dev.yml up
```

| URL | What |
|-----|------|
| `http://localhost:5173` | Dashboard dev server (Vite HMR) |
| `http://localhost:5174` | Admin dev server (Vite HMR) |
| `http://localhost:8000` | Backend (uvicorn --reload) |

## Widget preview (no Docker required)

Develop and iterate on a single widget without running the full Docker stack.

Start only the dashboard Vite dev server:

```bash
cd frontend/dashboard
npm install   # first time only
npm run dev
```

Then open one of these URLs:

| URL | What |
|-----|------|
| `http://localhost:5173/?preview` | Widget picker — lists all registered widgets |
| `http://localhost:5173/?widget=clock` | Preview the Clock widget |
| `http://localhost:5173/?widget=sabnzbd` | Preview the SABnzbd widget |

Each widget is rendered at three sizes side by side:

| Label | Grid size | Notes |
|-------|-----------|-------|
| S | widget's `defaultSize` | smallest useful size |
| M | +2 cols, +2 rows | comfortable reading size |
| L | +5 cols, +4 rows | full-panel display |

Vite HMR reloads the preview instantly on every file save.

Widgets that call `/api` are proxied to `localhost:8000`. If the backend is not running they show their normal loading/error state — no mocking needed.

## Adding a widget

1. Create `frontend/dashboard/src/components/widgets/MyWidget.tsx` and export a `definition: WidgetDefinition`.
2. Register it in `frontend/dashboard/src/components/widgets/index.ts`.
3. Open `http://localhost:5173/?widget=my_type` to preview.

See `ClockWidget.tsx` for a minimal example, `SABnzbdWidget.tsx` for one that fetches data.

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.12, uv |
| Database | SQLite — aiosqlite + SQLAlchemy 2 async |
| HTTP client | httpx (async) |
| Background jobs | APScheduler 3.x |
| Dashboard | React 18 + Vite 5 + react-grid-layout |
| Admin | React 19 + Vite 6 + TanStack Router v1 |
| Shared data fetching | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| State | Zustand (dashboard), Jotai (admin) |
