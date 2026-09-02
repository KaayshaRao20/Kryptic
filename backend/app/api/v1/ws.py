import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Live WebSocket stream for real-time transaction ingestion, risk alerts,
    digital twin state transitions, cascading risk propagation, and simulation progression.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and receive client messages / pings
            data = await websocket.receive_text()
            # Echo or acknowledge if client sends message
            if data == "ping":
                await websocket.send_text('{"type": "PONG"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.debug(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)
