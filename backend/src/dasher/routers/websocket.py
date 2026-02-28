import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from dasher.ws_manager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    await manager.connect(ws)
    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            action = msg.get("action")
            if action == "subscribe":
                channels = msg.get("channels", [])
                manager.subscribe(ws, channels)
                await ws.send_text(json.dumps({"action": "subscribed", "channels": channels}))
    except WebSocketDisconnect:
        manager.disconnect(ws)
