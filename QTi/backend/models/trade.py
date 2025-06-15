from typing import Optional, List, Dict, Any
from sqlalchemy import Column, String, ForeignKey, Boolean, JSON, Float, Integer, DateTime
from sqlalchemy.orm import relationship
from .base import Base

class Trade(Base):
    """
    Модель торговой сделки.
    """
    strategy_id = Column(ForeignKey("strategy.id"), nullable=False)
    exchange_id = Column(ForeignKey("exchange.id"), nullable=False)
    symbol = Column(String, nullable=False)  # Торговая пара
    side = Column(String, nullable=False)  # Сторона сделки (buy/sell)
    type = Column(String, nullable=False)  # Тип сделки (market/limit)
    price = Column(Float, nullable=False)  # Цена
    amount = Column(Float, nullable=False)  # Количество
    cost = Column(Float, nullable=False)  # Стоимость
    fee = Column(Float, nullable=False)  # Комиссия
    fee_currency = Column(String, nullable=False)  # Валюта комиссии
    order_id = Column(String, nullable=False)  # ID ордера на бирже
    status = Column(String, nullable=False)  # Статус сделки
    executed_at = Column(DateTime, nullable=False)  # Время исполнения
    metadata = Column(JSON, nullable=True)  # Дополнительные данные

    # Отношения
    strategy = relationship("Strategy", back_populates="trades")
    exchange = relationship("Exchange", back_populates="trades")

    def __repr__(self) -> str:
        """
        Строковое представление модели.
        
        Returns:
            str: Строковое представление
        """
        return f"<Trade {self.symbol} {self.side} {self.price}>"

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Преобразование модели в словарь.
        
        Args:
            include_sensitive: Включать ли чувствительные данные
            
        Returns:
            dict: Словарь с данными модели
        """
        data = super().to_dict()
        
        if not include_sensitive and "metadata" in data:
            metadata = data["metadata"]
            if isinstance(metadata, dict):
                # Удаление чувствительных данных из метаданных
                metadata.pop("api_key", None)
                metadata.pop("api_secret", None)
                metadata.pop("passphrase", None)
                data["metadata"] = metadata
        
        return data

    def get_metadata(self) -> dict:
        """
        Получение метаданных сделки.
        
        Returns:
            dict: Метаданные сделки
        """
        return self.metadata or {}

    def update_metadata(self, metadata: dict) -> None:
        """
        Обновление метаданных сделки.
        
        Args:
            metadata: Новые метаданные
        """
        current_metadata = self.get_metadata()
        current_metadata.update(metadata)
        self.metadata = current_metadata

    def calculate_profit(self, current_price: float) -> float:
        """
        Расчет прибыли/убытка.
        
        Args:
            current_price: Текущая цена
            
        Returns:
            float: Прибыль/убыток
        """
        if self.side == "buy":
            return (current_price - self.price) * self.amount
        else:
            return (self.price - current_price) * self.amount 