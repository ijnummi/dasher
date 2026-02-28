import json
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # channel → set of websockets subscribed to that channel
        self._subscriptions: dict[str, set[WebSocket]] = defaultdict(set)
        # websocket → set of channels it subscribed to
        self._connections: dict[WebSocket, set[str]] = {}

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[ws] = set()

    def disconnect(self, ws: WebSocket) -> None:
        channels = self._connections.pop(ws, set())
        for channel in channels:
            self._subscriptions[channel].discard(ws)

    def subscribe(self, ws: WebSocket, channels: list[str]) -> None:
        for channel in channels:
            self._subscriptions[channel].add(ws)
            if ws in self._connections:
                self._connections[ws].add(channel)

    async def broadcast(self, channel: str, message: dict) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._subscriptions.get(channel, [])):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def broadcast_all(self, message: dict) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._connections):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()
