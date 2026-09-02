import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages real-time WebSocket connections and broadcasts typed events to frontend."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcasts a typed event payload to all connected WebSocket clients.
        Supported event_types:
          - TRANSACTION_CREATED
          - RISK_DETECTED
          - NODE_STATUS_CHANGED
          - RISK_PROPAGATED
          - SIMULATION_STARTED
          - SIMULATION_PROGRESS
          - SIMULATION_COMPLETED
        """
        message = {
            "type": event_type,
            "data": data
        }
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.debug(f"Failed to send to websocket: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)


# Global WebSocket Manager singleton
ws_manager = WebSocketManager()
