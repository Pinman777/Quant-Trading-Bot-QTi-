from typing import Dict, Any, Set
import asyncio
import json
import logging
from fastapi import WebSocket
from datetime import datetime
from .remote import RemoteManager

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.bot_statuses: Dict[str, Dict[str, Any]] = {}
        self.remote_manager = RemoteManager()

    async def connect(self, websocket: WebSocket) -> None:
        """
        Подключить нового клиента
        """
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Новое WebSocket подключение. Всего подключений: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        """
        Отключить клиента
        """
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket отключен. Осталось подключений: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]) -> None:
        """
        Отправить сообщение всем подключенным клиентам
        """
        if not self.active_connections:
            return

        message["timestamp"] = datetime.utcnow().isoformat()
        message_str = json.dumps(message)

        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Ошибка при отправке сообщения: {str(e)}")
                disconnected.add(connection)

        # Удаляем отключенные соединения
        for connection in disconnected:
            self.disconnect(connection)

    async def update_bot_status(self, bot_name: str, status: Dict[str, Any]) -> None:
        """
        Обновить статус бота и отправить всем клиентам
        """
        self.bot_statuses[bot_name] = status
        await self.broadcast({
            "type": "bot_status",
            "bot_name": bot_name,
            "status": status
        })

    async def send_error(self, error: str) -> None:
        """
        Отправить сообщение об ошибке всем клиентам
        """
        await self.broadcast({
            "type": "error",
            "message": error
        })

    async def send_system_message(self, message: str) -> None:
        """
        Отправить системное сообщение всем клиентам
        """
        await self.broadcast({
            "type": "system",
            "message": message
        })

    async def handle_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Обработка входящих сообщений"""
        message_type = message.get("type")
        
        if message_type == "add_remote":
            success = await self.remote_manager.add_server(
                message["name"],
                message["host"],
                message["username"],
                message["password"]
            )
            if success:
                await self.broadcast({
                    "type": "remote_added",
                    "server": self.remote_manager.get_server(message["name"])
                })
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": "Сервер с таким именем уже существует"
                })

        elif message_type == "delete_remote":
            success = await self.remote_manager.delete_server(message["name"])
            if success:
                await self.broadcast({
                    "type": "remote_deleted",
                    "name": message["name"]
                })
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": "Сервер не найден"
                })

        elif message_type == "sync_remote":
            success = await self.remote_manager.sync_server(message["name"])
            if success:
                await self.broadcast({
                    "type": "remote_synced",
                    "server": self.remote_manager.get_server(message["name"])
                })
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": "Ошибка синхронизации"
                })

        elif message_type == "get_remotes":
            servers = self.remote_manager.get_servers()
            await websocket.send_json({
                "type": "remotes_list",
                "servers": servers
            })

    async def send_remote_status(self, server_name: str, status: str):
        """Отправка обновления статуса сервера"""
        await self.broadcast({
            "type": "remote_status",
            "name": server_name,
            "status": status
        })

# Создаем глобальный менеджер соединений
manager = WebSocketManager()

async def handle_websocket_connection(
    websocket: WebSocket,
    user_id: int,
    db: Session
):
    """
    Обрабатывает WebSocket соединение.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                message_type = message.get('type')
                
                if message_type == 'subscribe_exchange':
                    exchange_id = message.get('exchange_id')
                    if exchange_id:
                        manager.subscribe_to_exchange(websocket, exchange_id)
                        await websocket.send_text(json.dumps({
                            'type': 'subscription_confirmed',
                            'subscription_type': 'exchange',
                            'exchange_id': exchange_id
                        }))
                
                elif message_type == 'unsubscribe_exchange':
                    exchange_id = message.get('exchange_id')
                    if exchange_id:
                        manager.unsubscribe_from_exchange(websocket, exchange_id)
                        await websocket.send_text(json.dumps({
                            'type': 'unsubscription_confirmed',
                            'subscription_type': 'exchange',
                            'exchange_id': exchange_id
                        }))
                
                elif message_type == 'subscribe_strategy':
                    strategy_id = message.get('strategy_id')
                    if strategy_id:
                        manager.subscribe_to_strategy(websocket, strategy_id)
                        await websocket.send_text(json.dumps({
                            'type': 'subscription_confirmed',
                            'subscription_type': 'strategy',
                            'strategy_id': strategy_id
                        }))
                
                elif message_type == 'unsubscribe_strategy':
                    strategy_id = message.get('strategy_id')
                    if strategy_id:
                        manager.unsubscribe_from_strategy(websocket, strategy_id)
                        await websocket.send_text(json.dumps({
                            'type': 'unsubscription_confirmed',
                            'subscription_type': 'strategy',
                            'strategy_id': strategy_id
                        }))
                
                else:
                    await websocket.send_text(json.dumps({
                        'type': 'error',
                        'message': 'Unknown message type'
                    }))
            
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def broadcast_trade_update(trade_data: Dict):
    """
    Отправляет обновление о сделке всем подписанным клиентам.
    """
    message = json.dumps({
        'type': 'trade_update',
        'data': trade_data,
        'timestamp': datetime.utcnow().isoformat()
    })
    await manager.broadcast(message)

async def broadcast_system_update(update_data: Dict):
    """
    Отправляет системное обновление всем подключенным клиентам.
    """
    message = json.dumps({
        'type': 'system_update',
        'data': update_data,
        'timestamp': datetime.utcnow().isoformat()
    })
    await manager.broadcast(message) 