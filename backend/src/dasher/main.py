from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dasher.database import init_db
from dasher.routers import crawler, hass, layout, rss, sabnzbd, unifi, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Dasher API",
    description="Backend for the Dasher customizable dashboard",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
app.include_router(layout.router)
app.include_router(rss.router)
app.include_router(hass.router)
app.include_router(sabnzbd.router)
app.include_router(unifi.router)
app.include_router(crawler.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict:
    return {"message": "Dasher API", "docs": "/docs"}
