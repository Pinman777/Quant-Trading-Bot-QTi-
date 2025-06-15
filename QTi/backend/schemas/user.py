from typing import Optional
from pydantic import BaseModel, EmailStr, constr
from .base import BaseSchema

class UserBase(BaseSchema):
    """
    Базовая схема пользователя.
    """
    email: EmailStr
    username: constr(min_length=3, max_length=50)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """
    Схема для создания пользователя.
    """
    password: constr(min_length=8)

class UserUpdate(BaseSchema):
    """
    Схема для обновления пользователя.
    """
    email: Optional[EmailStr] = None
    username: Optional[constr(min_length=3, max_length=50)] = None
    full_name: Optional[str] = None
    password: Optional[constr(min_length=8)] = None

class UserInDB(UserBase):
    """
    Схема пользователя в базе данных.
    """
    id: int
    is_active: bool
    is_superuser: bool
    is_verified: bool
    two_factor_enabled: bool

class UserResponse(UserInDB):
    """
    Схема для ответа с данными пользователя.
    """
    pass

class UserLogin(BaseSchema):
    """
    Схема для входа пользователя.
    """
    email: EmailStr
    password: str
    two_factor_code: Optional[str] = None

class Token(BaseSchema):
    """
    Схема для токенов.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseSchema):
    """
    Схема для данных токена.
    """
    sub: str
    exp: int
    type: str

class PasswordReset(BaseSchema):
    """
    Схема для сброса пароля.
    """
    email: EmailStr

class PasswordUpdate(BaseSchema):
    """
    Схема для обновления пароля.
    """
    current_password: str
    new_password: constr(min_length=8)

class TwoFactorSetup(BaseSchema):
    """
    Схема для настройки двухфакторной аутентификации.
    """
    password: str

class TwoFactorVerify(BaseSchema):
    """
    Схема для верификации двухфакторной аутентификации.
    """
    code: str 