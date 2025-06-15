import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from ..logger import database_logger, log_extra

Base = declarative_base()

class Database:
    def __init__(self, config_path: str):
        """Инициализация сервиса базы данных
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.engine = None
        self.Session = None
        
        database_logger.info(
            "Сервис базы данных инициализирован",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация базы данных
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            database_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            database_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def connect(self):
        """Подключение к базе данных"""
        try:
            self.engine = create_engine(self.config["database_url"])
            self.Session = sessionmaker(bind=self.engine)
            
            database_logger.info(
                "Подключение к базе данных установлено",
                extra=log_extra({
                    "database_url": self.config["database_url"]
                })
            )
            
        except Exception as e:
            database_logger.error(
                "Ошибка подключения к базе данных",
                exc_info=True,
                extra=log_extra({
                    "database_url": self.config["database_url"],
                    "error": str(e)
                })
            )
            raise
            
    def create_tables(self):
        """Создание таблиц"""
        try:
            Base.metadata.create_all(self.engine)
            
            database_logger.info(
                "Таблицы созданы",
                extra=log_extra({
                    "tables": [table.__name__ for table in Base.__subclasses__()]
                })
            )
            
        except Exception as e:
            database_logger.error(
                "Ошибка создания таблиц",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    def get_session(self):
        """Получение сессии
        
        Returns:
            Session: Сессия базы данных
        """
        try:
            session = self.Session()
            
            database_logger.info(
                "Сессия получена",
                extra=log_extra({})
            )
            
            return session
            
        except Exception as e:
            database_logger.error(
                "Ошибка получения сессии",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    def close_session(self, session):
        """Закрытие сессии
        
        Args:
            session: Сессия базы данных
        """
        try:
            session.close()
            
            database_logger.info(
                "Сессия закрыта",
                extra=log_extra({})
            )
            
        except Exception as e:
            database_logger.error(
                "Ошибка закрытия сессии",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    def execute_query(self, query: str, params: Dict[str, Any] = None):
        """Выполнение запроса
        
        Args:
            query: SQL запрос
            params: Параметры запроса
            
        Returns:
            List[Dict[str, Any]]: Результаты запроса
        """
        try:
            session = self.get_session()
            result = session.execute(query, params or {})
            self.close_session(session)
            
            database_logger.info(
                "Запрос выполнен",
                extra=log_extra({
                    "query": query,
                    "params": params
                })
            )
            
            return [dict(row) for row in result]
            
        except Exception as e:
            database_logger.error(
                "Ошибка выполнения запроса",
                exc_info=True,
                extra=log_extra({
                    "query": query,
                    "params": params,
                    "error": str(e)
                })
            )
            raise
            
    async def execute(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Выполнение SQL запроса
        
        Args:
            query: SQL запрос
            params: Параметры запроса
            
        Returns:
            Any: Результат запроса
        """
        try:
            async with self.async_session() as session:
                result = await session.execute(text(query), params or {})
                await session.commit()
                
                database_logger.debug(
                    "SQL запрос выполнен",
                    extra=log_extra({
                        "query": query,
                        "params": params
                    })
                )
                return result
                
        except Exception as e:
            database_logger.error(
                "Ошибка выполнения SQL запроса",
                exc_info=True,
                extra=log_extra({
                    "query": query,
                    "params": params,
                    "error": str(e)
                })
            )
            raise
            
    async def fetch_one(self, query: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Получение одной записи
        
        Args:
            query: SQL запрос
            params: Параметры запроса
            
        Returns:
            Optional[Dict[str, Any]]: Запись или None
        """
        try:
            result = await self.execute(query, params)
            row = result.fetchone()
            
            if row:
                database_logger.debug(
                    "Запись получена",
                    extra=log_extra({
                        "query": query,
                        "params": params
                    })
                )
                return dict(row)
                
            database_logger.debug(
                "Запись не найдена",
                extra=log_extra({
                    "query": query,
                    "params": params
                })
            )
            return None
            
        except Exception as e:
            database_logger.error(
                "Ошибка получения записи",
                exc_info=True,
                extra=log_extra({
                    "query": query,
                    "params": params,
                    "error": str(e)
                })
            )
            raise
            
    async def fetch_all(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Получение всех записей
        
        Args:
            query: SQL запрос
            params: Параметры запроса
            
        Returns:
            List[Dict[str, Any]]: Список записей
        """
        try:
            result = await self.execute(query, params)
            rows = result.fetchall()
            
            database_logger.debug(
                "Записи получены",
                extra=log_extra({
                    "query": query,
                    "params": params,
                    "count": len(rows)
                })
            )
            return [dict(row) for row in rows]
            
        except Exception as e:
            database_logger.error(
                "Ошибка получения записей",
                exc_info=True,
                extra=log_extra({
                    "query": query,
                    "params": params,
                    "error": str(e)
                })
            )
            raise
            
    async def insert(self, table: str, data: Dict[str, Any]) -> int:
        """Вставка записи
        
        Args:
            table: Имя таблицы
            data: Данные для вставки
            
        Returns:
            int: ID вставленной записи
        """
        try:
            columns = ", ".join(data.keys())
            values = ", ".join(f":{key}" for key in data.keys())
            query = f"INSERT INTO {table} ({columns}) VALUES ({values}) RETURNING id"
            
            result = await self.execute(query, data)
            row = result.fetchone()
            
            database_logger.info(
                "Запись вставлена",
                extra=log_extra({
                    "table": table,
                    "data": data,
                    "id": row[0] if row else None
                })
            )
            return row[0] if row else None
            
        except Exception as e:
            database_logger.error(
                "Ошибка вставки записи",
                exc_info=True,
                extra=log_extra({
                    "table": table,
                    "data": data,
                    "error": str(e)
                })
            )
            raise
            
    async def update(self, table: str, id: int, data: Dict[str, Any]) -> bool:
        """Обновление записи
        
        Args:
            table: Имя таблицы
            id: ID записи
            data: Данные для обновления
            
        Returns:
            bool: True если запись обновлена
        """
        try:
            set_clause = ", ".join(f"{key} = :{key}" for key in data.keys())
            query = f"UPDATE {table} SET {set_clause} WHERE id = :id"
            
            data["id"] = id
            result = await self.execute(query, data)
            
            updated = result.rowcount > 0
            
            database_logger.info(
                "Запись обновлена" if updated else "Запись не найдена",
                extra=log_extra({
                    "table": table,
                    "id": id,
                    "data": data,
                    "updated": updated
                })
            )
            return updated
            
        except Exception as e:
            database_logger.error(
                "Ошибка обновления записи",
                exc_info=True,
                extra=log_extra({
                    "table": table,
                    "id": id,
                    "data": data,
                    "error": str(e)
                })
            )
            raise
            
    async def delete(self, table: str, id: int) -> bool:
        """Удаление записи
        
        Args:
            table: Имя таблицы
            id: ID записи
            
        Returns:
            bool: True если запись удалена
        """
        try:
            query = f"DELETE FROM {table} WHERE id = :id"
            result = await self.execute(query, {"id": id})
            
            deleted = result.rowcount > 0
            
            database_logger.info(
                "Запись удалена" if deleted else "Запись не найдена",
                extra=log_extra({
                    "table": table,
                    "id": id,
                    "deleted": deleted
                })
            )
            return deleted
            
        except Exception as e:
            database_logger.error(
                "Ошибка удаления записи",
                exc_info=True,
                extra=log_extra({
                    "table": table,
                    "id": id,
                    "error": str(e)
                })
            )
            raise 