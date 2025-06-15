from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..core.websocket import WebSocketManager
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Создаем глобальный менеджер WebSocket
websocket_manager = WebSocketManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket эндпоинт для реального времени
    """
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Ожидаем сообщения от клиента
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await websocket_manager.handle_message(websocket, message)
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Неверный формат сообщения"
                })
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Ошибка в WebSocket соединении: {str(e)}")
        websocket_manager.disconnect(websocket) 