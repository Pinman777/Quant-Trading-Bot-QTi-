from typing import Optional, List, Dict, Any
from sqlalchemy import Column, String, ForeignKey, Boolean, JSON, Float, Integer
from sqlalchemy.orm import relationship
from .base import Base

class Strategy(Base):
    """
    Модель торговой стратегии.
    """
    user_id = Column(ForeignKey("user.id"), nullable=False)
    exchange_id = Column(ForeignKey("exchange.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, nullable=False)  # Тип стратегии (например, "grid", "dca", "passivbot")
    symbol = Column(String, nullable=False)  # Торговая пара
    is_active = Column(Boolean, default=True, nullable=False)
    settings = Column(JSON, nullable=False)  # Настройки стратегии
    performance = Column(JSON, nullable=True)  # Метрики производительности
    last_run = Column(String, nullable=True)  # Время последнего запуска
    next_run = Column(String, nullable=True)  # Время следующего запуска
    status = Column(String, nullable=False, default="stopped")  # Статус стратегии
    error = Column(String, nullable=True)  # Последняя ошибка

    # Отношения
    user = relationship("User", back_populates="strategies")
    exchange = relationship("Exchange", back_populates="strategies")
    trades = relationship("Trade", back_populates="strategy")

    def __repr__(self) -> str:
        """
        Строковое представление модели.
        
        Returns:
            str: Строковое представление
        """
        return f"<Strategy {self.name} ({self.type})>"

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Преобразование модели в словарь.
        
        Args:
            include_sensitive: Включать ли чувствительные данные
            
        Returns:
            dict: Словарь с данными модели
        """
        data = super().to_dict()
        
        if not include_sensitive and "settings" in data:
            settings = data["settings"]
            if isinstance(settings, dict):
                # Удаление чувствительных данных из настроек
                settings.pop("api_key", None)
                settings.pop("api_secret", None)
                settings.pop("passphrase", None)
                data["settings"] = settings
        
        return data

    def get_settings(self) -> dict:
        """
        Получение настроек стратегии.
        
        Returns:
            dict: Настройки стратегии
        """
        return self.settings or {}

    def update_settings(self, settings: dict) -> None:
        """
        Обновление настроек стратегии.
        
        Args:
            settings: Новые настройки
        """
        current_settings = self.get_settings()
        current_settings.update(settings)
        self.settings = current_settings

    def update_performance(self, metrics: dict) -> None:
        """
        Обновление метрик производительности.
        
        Args:
            metrics: Новые метрики
        """
        current_metrics = self.performance or {}
        current_metrics.update(metrics)
        self.performance = current_metrics

    def get_performance(self) -> dict:
        """
        Получение метрик производительности.
        
        Returns:
            dict: Метрики производительности
        """
        return self.performance or {} 