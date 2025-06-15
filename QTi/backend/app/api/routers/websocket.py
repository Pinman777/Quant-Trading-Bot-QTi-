from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Optional
import uuid
from ...websockets.manager import WebSocketManager
from ...notifications.manager import NotificationManager

router = APIRouter(tags=["websocket"])
websocket_manager = WebSocketManager()
notification_manager = NotificationManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    client_id = str(uuid.uuid4())
    try:
        await websocket_manager.connect(websocket, client_id)
        notification_manager.register_websocket_client(client_id)
        
        # Subscribe to default topics
        websocket_manager.subscribe(client_id, "notifications")
        websocket_manager.subscribe(client_id, "bots")
        
        try:
            while True:
                # Wait for messages from client
                data = await websocket.receive_json()
                
                # Handle subscription messages
                if data.get("type") == "subscribe":
                    topic = data.get("topic")
                    if topic:
                        websocket_manager.subscribe(client_id, topic)
                        await websocket.send_json({
                            "type": "subscription",
                            "status": "subscribed",
                            "topic": topic
                        })
                
                # Handle unsubscribe messages
                elif data.get("type") == "unsubscribe":
                    topic = data.get("topic")
                    if topic:
                        websocket_manager.unsubscribe(client_id, topic)
                        await websocket.send_json({
                            "type": "subscription",
                            "status": "unsubscribed",
                            "topic": topic
                        })
                
                # Handle ping messages
                elif data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": data.get("timestamp")
                    })
                
        except WebSocketDisconnect:
            websocket_manager.disconnect(client_id)
            notification_manager.unregister_websocket_client(client_id)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        websocket_manager.disconnect(client_id)
        notification_manager.unregister_websocket_client(client_id)

@router.get("/ws/status")
async def get_websocket_status():
    """Get WebSocket server status."""
    return {
        "active_connections": websocket_manager.get_active_connections_count()
    } 