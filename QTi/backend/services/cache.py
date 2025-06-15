import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import redis
from ..logger import cache_logger, log_extra

class Cache:
    def __init__(self, config_path: str):
        """Инициализация сервиса кэширования
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.redis = None
        
        cache_logger.info(
            "Сервис кэширования инициализирован",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация кэша
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            cache_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            cache_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def connect(self):
        """Подключение к Redis"""
        try:
            self.redis = redis.Redis(
                host=self.config["redis_host"],
                port=self.config["redis_port"],
                db=self.config["redis_db"],
                password=self.config.get("redis_password"),
                decode_responses=True
            )
            
            cache_logger.info(
                "Подключение к Redis установлено",
                extra=log_extra({
                    "host": self.config["redis_host"],
                    "port": self.config["redis_port"],
                    "db": self.config["redis_db"]
                })
            )
            
        except Exception as e:
            cache_logger.error(
                "Ошибка подключения к Redis",
                exc_info=True,
                extra=log_extra({
                    "host": self.config["redis_host"],
                    "port": self.config["redis_port"],
                    "db": self.config["redis_db"],
                    "error": str(e)
                })
            )
            raise
            
    def get(self, key: str) -> Optional[str]:
        """Получение значения из кэша
        
        Args:
            key: Ключ
            
        Returns:
            Optional[str]: Значение
        """
        try:
            value = self.redis.get(key)
            
            cache_logger.info(
                "Значение получено из кэша",
                extra=log_extra({
                    "key": key,
                    "value": value
                })
            )
            
            return value
            
        except Exception as e:
            cache_logger.error(
                "Ошибка получения значения из кэша",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "error": str(e)
                })
            )
            raise
            
    def set(self, key: str, value: str, expire: Optional[int] = None):
        """Установка значения в кэш
        
        Args:
            key: Ключ
            value: Значение
            expire: Время жизни в секундах
        """
        try:
            self.redis.set(key, value, ex=expire)
            
            cache_logger.info(
                "Значение установлено в кэш",
                extra=log_extra({
                    "key": key,
                    "value": value,
                    "expire": expire
                })
            )
            
        except Exception as e:
            cache_logger.error(
                "Ошибка установки значения в кэш",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "value": value,
                    "expire": expire,
                    "error": str(e)
                })
            )
            raise
            
    def delete(self, key: str):
        """Удаление значения из кэша
        
        Args:
            key: Ключ
        """
        try:
            self.redis.delete(key)
            
            cache_logger.info(
                "Значение удалено из кэша",
                extra=log_extra({
                    "key": key
                })
            )
            
        except Exception as e:
            cache_logger.error(
                "Ошибка удаления значения из кэша",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "error": str(e)
                })
            )
            raise
            
    def exists(self, key: str) -> bool:
        """Проверка существования ключа
        
        Args:
            key: Ключ
            
        Returns:
            bool: True если ключ существует
        """
        try:
            exists = bool(self.redis.exists(key))
            
            cache_logger.info(
                "Проверка существования ключа",
                extra=log_extra({
                    "key": key,
                    "exists": exists
                })
            )
            
            return exists
            
        except Exception as e:
            cache_logger.error(
                "Ошибка проверки существования ключа",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "error": str(e)
                })
            )
            raise
            
    def expire(self, key: str, seconds: int):
        """Установка времени жизни ключа
        
        Args:
            key: Ключ
            seconds: Время жизни в секундах
        """
        try:
            self.redis.expire(key, seconds)
            
            cache_logger.info(
                "Время жизни ключа установлено",
                extra=log_extra({
                    "key": key,
                    "seconds": seconds
                })
            )
            
        except Exception as e:
            cache_logger.error(
                "Ошибка установки времени жизни ключа",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "seconds": seconds,
                    "error": str(e)
                })
            )
            raise
            
    def ttl(self, key: str) -> int:
        """Получение оставшегося времени жизни ключа
        
        Args:
            key: Ключ
            
        Returns:
            int: Оставшееся время жизни в секундах
        """
        try:
            ttl = self.redis.ttl(key)
            
            cache_logger.info(
                "Оставшееся время жизни ключа получено",
                extra=log_extra({
                    "key": key,
                    "ttl": ttl
                })
            )
            
            return ttl
            
        except Exception as e:
            cache_logger.error(
                "Ошибка получения оставшегося времени жизни ключа",
                exc_info=True,
                extra=log_extra({
                    "key": key,
                    "error": str(e)
                })
            )
            raise 