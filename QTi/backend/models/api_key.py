from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .base import Base

class APIKey(Base):
    """
    Модель API ключа.
    """
    user_id = Column(ForeignKey("user.id"), nullable=False)
    exchange = Column(String, nullable=False)
    api_key = Column(String, nullable=False)
    api_secret = Column(String, nullable=False)
    passphrase = Column(String, nullable=True)  # Для некоторых бирж (например, Coinbase)
    label = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    last_used = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Отношения
    user = relationship("User", back_populates="api_keys")

    def __repr__(self) -> str:
        """
        Строковое представление модели.
        
        Returns:
            str: Строковое представление
        """
        return f"<APIKey {self.exchange} {self.label}>"

    def is_expired(self) -> bool:
        """
        Проверка срока действия ключа.
        
        Returns:
            bool: True если ключ истек
        """
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Преобразование модели в словарь.
        
        Args:
            include_sensitive: Включать ли чувствительные данные
            
        Returns:
            dict: Словарь с данными модели
        """
        data = super().to_dict()
        
        if not include_sensitive:
            data.pop("api_key", None)
            data.pop("api_secret", None)
            data.pop("passphrase", None)
        
        return data

    def update_last_used(self) -> None:
        """
        Обновление времени последнего использования.
        """
        self.last_used = datetime.utcnow() 