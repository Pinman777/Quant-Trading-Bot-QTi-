from typing import Optional
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import Base

class User(Base):
    """
    Модель пользователя.
    """
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String, nullable=True)
    reset_password_token = Column(String, nullable=True)
    two_factor_secret = Column(String, nullable=True)
    two_factor_enabled = Column(Boolean, default=False, nullable=False)

    # Отношения
    # TODO: Добавить отношения с другими моделями
    # api_keys = relationship("APIKey", back_populates="user")
    # exchanges = relationship("Exchange", back_populates="user")
    # strategies = relationship("Strategy", back_populates="user")

    def __repr__(self) -> str:
        """
        Строковое представление модели.
        
        Returns:
            str: Строковое представление
        """
        return f"<User {self.email}>"

    @property
    def is_active(self) -> bool:
        """
        Проверка активности пользователя.
        
        Returns:
            bool: True если пользователь активен
        """
        return super().is_active and self.is_verified

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
            data.pop("hashed_password", None)
            data.pop("verification_token", None)
            data.pop("reset_password_token", None)
            data.pop("two_factor_secret", None)
        
        return data 