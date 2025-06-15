import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from ..logger import api_logger, log_extra

class API:
    def __init__(self, config_path: str):
        """Инициализация API сервиса
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.app = FastAPI(
            title=self.config.get("title", "QTi API"),
            description=self.config.get("description", "API для торгового бота QTi"),
            version=self.config.get("version", "1.0.0")
        )
        
        api_logger.info(
            "API сервис инициализирован",
            extra=log_extra({
                "config_path": config_path,
                "title": self.app.title,
                "version": self.app.version
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация API
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            api_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            api_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def add_route(self, path: str, endpoint: Any, methods: List[str], **kwargs):
        """Добавление маршрута
        
        Args:
            path: Путь маршрута
            endpoint: Обработчик маршрута
            methods: HTTP методы
            **kwargs: Дополнительные параметры
        """
        try:
            self.app.add_api_route(path, endpoint, methods=methods, **kwargs)
            
            api_logger.info(
                "Маршрут добавлен",
                extra=log_extra({
                    "path": path,
                    "methods": methods,
                    "kwargs": kwargs
                })
            )
            
        except Exception as e:
            api_logger.error(
                "Ошибка добавления маршрута",
                exc_info=True,
                extra=log_extra({
                    "path": path,
                    "methods": methods,
                    "kwargs": kwargs,
                    "error": str(e)
                })
            )
            raise
            
    def add_middleware(self, middleware: Any, **kwargs):
        """Добавление промежуточного ПО
        
        Args:
            middleware: Промежуточное ПО
            **kwargs: Дополнительные параметры
        """
        try:
            self.app.add_middleware(middleware, **kwargs)
            
            api_logger.info(
                "Промежуточное ПО добавлено",
                extra=log_extra({
                    "middleware": middleware.__name__,
                    "kwargs": kwargs
                })
            )
            
        except Exception as e:
            api_logger.error(
                "Ошибка добавления промежуточного ПО",
                exc_info=True,
                extra=log_extra({
                    "middleware": middleware.__name__,
                    "kwargs": kwargs,
                    "error": str(e)
                })
            )
            raise
            
    def add_exception_handler(self, exc_class: Any, handler: Any):
        """Добавление обработчика исключений
        
        Args:
            exc_class: Класс исключения
            handler: Обработчик исключения
        """
        try:
            self.app.add_exception_handler(exc_class, handler)
            
            api_logger.info(
                "Обработчик исключений добавлен",
                extra=log_extra({
                    "exc_class": exc_class.__name__,
                    "handler": handler.__name__
                })
            )
            
        except Exception as e:
            api_logger.error(
                "Ошибка добавления обработчика исключений",
                exc_info=True,
                extra=log_extra({
                    "exc_class": exc_class.__name__,
                    "handler": handler.__name__,
                    "error": str(e)
                })
            )
            raise
            
    def add_event_handler(self, event_type: str, handler: Any):
        """Добавление обработчика событий
        
        Args:
            event_type: Тип события
            handler: Обработчик события
        """
        try:
            self.app.add_event_handler(event_type, handler)
            
            api_logger.info(
                "Обработчик событий добавлен",
                extra=log_extra({
                    "event_type": event_type,
                    "handler": handler.__name__
                })
            )
            
        except Exception as e:
            api_logger.error(
                "Ошибка добавления обработчика событий",
                exc_info=True,
                extra=log_extra({
                    "event_type": event_type,
                    "handler": handler.__name__,
                    "error": str(e)
                })
            )
            raise
            
    def add_websocket_route(self, path: str, endpoint: Any, **kwargs):
        """Добавление WebSocket маршрута
        
        Args:
            path: Путь маршрута
            endpoint: Обработчик маршрута
            **kwargs: Дополнительные параметры
        """
        try:
            self.app.add_api_websocket_route(path, endpoint, **kwargs)
            
            api_logger.info(
                "WebSocket маршрут добавлен",
                extra=log_extra({
                    "path": path,
                    "kwargs": kwargs
                })
            )
            
        except Exception as e:
            api_logger.error(
                "Ошибка добавления WebSocket маршрута",
                exc_info=True,
                extra=log_extra({
                    "path": path,
                    "kwargs": kwargs,
                    "error": str(e)
                })
            )
            raise
            
    def get_app(self) -> FastAPI:
        """Получение приложения FastAPI
        
        Returns:
            FastAPI: Приложение FastAPI
        """
        try:
            api_logger.info(
                "Приложение FastAPI получено",
                extra=log_extra({
                    "title": self.app.title,
                    "version": self.app.version
                })
            )
            return self.app
            
        except Exception as e:
            api_logger.error(
                "Ошибка получения приложения FastAPI",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise 