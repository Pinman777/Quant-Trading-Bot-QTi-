from typing import Optional, List
from sqlalchemy import Column, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .base import Base

class Exchange(Base):
    """
    Модель биржи.
    """
    user_id = Column(ForeignKey("user.id"), nullable=False)
    name = Column(String, nullable=False)
    api_key_id = Column(ForeignKey("apikey.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    settings = Column(JSON, nullable=True)  # Дополнительные настройки биржи
    testnet = Column(Boolean, default=False, nullable=False)  # Использование тестовой сети

    # Отношения
    user = relationship("User", back_populates="exchanges")
    api_key = relationship("APIKey", back_populates="exchanges")
    strategies = relationship("Strategy", back_populates="exchange")

    def __repr__(self) -> str:
        """
        Строковое представление модели.
        
        Returns:
            str: Строковое представление
        """
        return f"<Exchange {self.name}>"

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
        Получение настроек биржи.
        
        Returns:
            dict: Настройки биржи
        """
        return self.settings or {}

    def update_settings(self, settings: dict) -> None:
        """
        Обновление настроек биржи.
        
        Args:
            settings: Новые настройки
        """
        current_settings = self.get_settings()
        current_settings.update(settings)
        self.settings = current_settings 