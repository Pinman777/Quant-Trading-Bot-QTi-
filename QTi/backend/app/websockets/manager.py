from typing import Dict, Set, Optional
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        self._active_connections: Dict[str, WebSocket] = {}
        self._client_subscriptions: Dict[str, Set[str]] = {}  # client_id -> set of topics

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect new WebSocket client."""
        await websocket.accept()
        self._active_connections[client_id] = websocket
        self._client_subscriptions[client_id] = set()

    def disconnect(self, client_id: str):
        """Disconnect WebSocket client."""
        self._active_connections.pop(client_id, None)
        self._client_subscriptions.pop(client_id, None)

    def subscribe(self, client_id: str, topic: str):
        """Subscribe client to a topic."""
        if client_id in self._client_subscriptions:
            self._client_subscriptions[client_id].add(topic)

    def unsubscribe(self, client_id: str, topic: str):
        """Unsubscribe client from a topic."""
        if client_id in self._client_subscriptions:
            self._client_subscriptions[client_id].discard(topic)

    async def broadcast(self, message: dict, topic: Optional[str] = None):
        """Broadcast message to all clients or to specific topic subscribers."""
        if not self._active_connections:
            return

        message["timestamp"] = datetime.utcnow().isoformat()
        message_str = json.dumps(message)

        if topic:
            # Send only to clients subscribed to the topic
            for client_id, subscriptions in self._client_subscriptions.items():
                if topic in subscriptions:
                    if websocket := self._active_connections.get(client_id):
                        try:
                            await websocket.send_text(message_str)
                        except Exception as e:
                            print(f"Error sending message to client {client_id}: {e}")
                            self.disconnect(client_id)
        else:
            # Send to all connected clients
            for client_id, websocket in list(self._active_connections.items()):
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    print(f"Error sending message to client {client_id}: {e}")
                    self.disconnect(client_id)

    async def send_personal_message(self, message: dict, client_id: str):
        """Send message to specific client."""
        if websocket := self._active_connections.get(client_id):
            try:
                message["timestamp"] = datetime.utcnow().isoformat()
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending personal message to client {client_id}: {e}")
                self.disconnect(client_id)

    def get_active_connections_count(self) -> int:
        """Get number of active connections."""
        return len(self._active_connections)

    def get_client_subscriptions(self, client_id: str) -> Set[str]:
        """Get client's subscriptions."""
        return self._client_subscriptions.get(client_id, set()) 