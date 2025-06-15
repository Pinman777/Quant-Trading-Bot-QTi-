import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from ..logger import websocket_logger, log_extra

class WebSocketManager:
    def __init__(self):
        """Инициализация менеджера WebSocket соединений"""
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        
        websocket_logger.info(
            "WebSocket менеджер инициализирован",
            extra=log_extra({})
        )
        
    async def connect(self, websocket: WebSocket, client_id: str):
        """Подключение клиента
        
        Args:
            websocket: WebSocket соединение
            client_id: ID клиента
        """
        try:
            await websocket.accept()
            
            if client_id not in self.active_connections:
                self.active_connections[client_id] = set()
            self.active_connections[client_id].add(websocket)
            
            websocket_logger.info(
                "Клиент подключен",
                extra=log_extra({
                    "client_id": client_id
                })
            )
            
        except Exception as e:
            websocket_logger.error(
                "Ошибка подключения клиента",
                exc_info=True,
                extra=log_extra({
                    "client_id": client_id,
                    "error": str(e)
                })
            )
            raise
            
    def disconnect(self, websocket: WebSocket, client_id: str):
        """Отключение клиента
        
        Args:
            websocket: WebSocket соединение
            client_id: ID клиента
        """
        try:
            if client_id in self.active_connections:
                self.active_connections[client_id].remove(websocket)
                if not self.active_connections[client_id]:
                    del self.active_connections[client_id]
                    
            websocket_logger.info(
                "Клиент отключен",
                extra=log_extra({
                    "client_id": client_id
                })
            )
            
        except Exception as e:
            websocket_logger.error(
                "Ошибка отключения клиента",
                exc_info=True,
                extra=log_extra({
                    "client_id": client_id,
                    "error": str(e)
                })
            )
            raise
            
    async def send_personal_message(self, message: str, client_id: str):
        """Отправка личного сообщения
        
        Args:
            message: Сообщение
            client_id: ID клиента
        """
        try:
            if client_id in self.active_connections:
                for connection in self.active_connections[client_id]:
                    await connection.send_text(message)
                    
                websocket_logger.info(
                    "Личное сообщение отправлено",
                    extra=log_extra({
                        "client_id": client_id,
                        "message": message
                    })
                )
            else:
                websocket_logger.warning(
                    "Клиент не найден",
                    extra=log_extra({
                        "client_id": client_id
                    })
                )
                
        except Exception as e:
            websocket_logger.error(
                "Ошибка отправки личного сообщения",
                exc_info=True,
                extra=log_extra({
                    "client_id": client_id,
                    "message": message,
                    "error": str(e)
                })
            )
            raise
            
    async def broadcast(self, message: str):
        """Отправка сообщения всем клиентам
        
        Args:
            message: Сообщение
        """
        try:
            for client_id in self.active_connections:
                for connection in self.active_connections[client_id]:
                    await connection.send_text(message)
                    
            websocket_logger.info(
                "Сообщение отправлено всем клиентам",
                extra=log_extra({
                    "message": message
                })
            )
            
        except Exception as e:
            websocket_logger.error(
                "Ошибка отправки сообщения всем клиентам",
                exc_info=True,
                extra=log_extra({
                    "message": message,
                    "error": str(e)
                })
            )
            raise
            
    async def broadcast_except(self, message: str, exclude_client_id: str):
        """Отправка сообщения всем клиентам кроме указанного
        
        Args:
            message: Сообщение
            exclude_client_id: ID исключаемого клиента
        """
        try:
            for client_id in self.active_connections:
                if client_id != exclude_client_id:
                    for connection in self.active_connections[client_id]:
                        await connection.send_text(message)
                        
            websocket_logger.info(
                "Сообщение отправлено всем клиентам кроме указанного",
                extra=log_extra({
                    "message": message,
                    "exclude_client_id": exclude_client_id
                })
            )
            
        except Exception as e:
            websocket_logger.error(
                "Ошибка отправки сообщения всем клиентам кроме указанного",
                exc_info=True,
                extra=log_extra({
                    "message": message,
                    "exclude_client_id": exclude_client_id,
                    "error": str(e)
                })
            )
            raise
            
    def get_active_connections(self) -> Dict[str, int]:
        """Получение количества активных соединений по клиентам
        
        Returns:
            Dict[str, int]: Словарь {client_id: количество соединений}
        """
        try:
            connections = {
                client_id: len(connections)
                for client_id, connections in self.active_connections.items()
            }
            
            websocket_logger.info(
                "Получено количество активных соединений",
                extra=log_extra({
                    "connections": connections
                })
            )
            
            return connections
            
        except Exception as e:
            websocket_logger.error(
                "Ошибка получения количества активных соединений",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise 