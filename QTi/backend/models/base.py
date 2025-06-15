from datetime import datetime
from typing import Any
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, DateTime, Boolean

class Base(DeclarativeBase):
    """
    Базовый класс для всех моделей.
    """
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Автоматическое определение имени таблицы на основе имени класса.
        
        Returns:
            str: Имя таблицы в нижнем регистре
        """
        return cls.__name__.lower()

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    def to_dict(self) -> dict[str, Any]:
        """
        Преобразование модели в словарь.
        
        Returns:
            dict[str, Any]: Словарь с данными модели
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def update(self, **kwargs: Any) -> None:
        """
        Обновление полей модели.
        
        Args:
            **kwargs: Поля для обновления
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value) 