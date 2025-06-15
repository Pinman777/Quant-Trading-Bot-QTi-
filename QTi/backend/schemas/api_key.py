from typing import Optional
from datetime import datetime
from pydantic import constr
from .base import BaseSchema

class APIKeyBase(BaseSchema):
    """
    Базовая схема API ключа.
    """
    exchange: constr(min_length=1)
    label: Optional[str] = None
    is_active: bool = True

class APIKeyCreate(APIKeyBase):
    """
    Схема для создания API ключа.
    """
    api_key: constr(min_length=1)
    api_secret: constr(min_length=1)
    passphrase: Optional[str] = None

class APIKeyUpdate(BaseSchema):
    """
    Схема для обновления API ключа.
    """
    label: Optional[str] = None
    is_active: Optional[bool] = None
    api_key: Optional[constr(min_length=1)] = None
    api_secret: Optional[constr(min_length=1)] = None
    passphrase: Optional[str] = None

class APIKeyInDB(APIKeyBase):
    """
    Схема API ключа в базе данных.
    """
    id: int
    user_id: int
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class APIKeyResponse(APIKeyInDB):
    """
    Схема для ответа с данными API ключа.
    """
    pass

class APIKeyVerify(BaseSchema):
    """
    Схема для проверки API ключа.
    """
    api_key: constr(min_length=1)
    api_secret: constr(min_length=1)
    passphrase: Optional[str] = None 