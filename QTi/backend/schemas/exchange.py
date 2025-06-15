from typing import Optional, Dict, Any
from pydantic import constr
from .base import BaseSchema

class ExchangeBase(BaseSchema):
    """
    Базовая схема биржи.
    """
    name: constr(min_length=1)
    api_key_id: int
    is_active: bool = True
    testnet: bool = False

class ExchangeCreate(ExchangeBase):
    """
    Схема для создания биржи.
    """
    settings: Optional[Dict[str, Any]] = None

class ExchangeUpdate(BaseSchema):
    """
    Схема для обновления биржи.
    """
    name: Optional[constr(min_length=1)] = None
    api_key_id: Optional[int] = None
    is_active: Optional[bool] = None
    testnet: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None

class ExchangeInDB(ExchangeBase):
    """
    Схема биржи в базе данных.
    """
    id: int
    user_id: int
    settings: Optional[Dict[str, Any]] = None

class ExchangeResponse(ExchangeInDB):
    """
    Схема для ответа с данными биржи.
    """
    pass

class ExchangeSettings(BaseSchema):
    """
    Схема для настроек биржи.
    """
    settings: Dict[str, Any]

class ExchangeTest(BaseSchema):
    """
    Схема для тестирования подключения к бирже.
    """
    api_key_id: int
    testnet: bool = False 