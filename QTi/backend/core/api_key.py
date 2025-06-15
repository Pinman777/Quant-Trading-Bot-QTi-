import secrets
from typing import Optional

from sqlalchemy.orm import Session

from ..crud import api_key as crud_api_key
from ..schemas.api_key import APIKeyCreate

def generate_api_key() -> str:
    """
    Генерирует новый API ключ.
    """
    return secrets.token_urlsafe(32)

def create_api_key(
    db: Session,
    user_id: int,
    name: str,
    description: Optional[str] = None
) -> str:
    """
    Создает новый API ключ для пользователя.
    """
    api_key = generate_api_key()
    api_key_in = APIKeyCreate(
        name=name,
        description=description,
        key=api_key
    )
    crud_api_key.api_key.create_with_user(db, obj_in=api_key_in, user_id=user_id)
    return api_key

def verify_api_key(db: Session, api_key: str) -> bool:
    """
    Проверяет валидность API ключа.
    """
    db_api_key = crud_api_key.api_key.get_by_key(db, key=api_key)
    if not db_api_key:
        return False
    if not db_api_key.is_active:
        return False
    return True

def get_user_by_api_key(db: Session, api_key: str):
    """
    Получает пользователя по API ключу.
    """
    db_api_key = crud_api_key.api_key.get_by_key(db, key=api_key)
    if not db_api_key:
        return None
    return db_api_key.user 