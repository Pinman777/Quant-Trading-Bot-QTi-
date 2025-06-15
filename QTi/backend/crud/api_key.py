from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.api_key import APIKey
from ..schemas.api_key import APIKeyCreate, APIKeyUpdate
from .base import CRUDBase

class CRUDAPIKey(CRUDBase[APIKey, APIKeyCreate, APIKeyUpdate]):
    """
    CRUD операции для API ключей.
    """
    def get_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[APIKey]:
        """
        Получение API ключей пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[APIKey]: Список API ключей
        """
        return (
            db.query(self.model)
            .filter(APIKey.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_exchange(
        self,
        db: Session,
        *,
        user_id: int,
        exchange: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[APIKey]:
        """
        Получение API ключей для конкретной биржи.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            exchange: Название биржи
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[APIKey]: Список API ключей
        """
        return (
            db.query(self.model)
            .filter(
                APIKey.user_id == user_id,
                APIKey.exchange == exchange
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in: APIKeyCreate, user_id: int) -> APIKey:
        """
        Создание API ключа.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            user_id: ID пользователя
            
        Returns:
            APIKey: Созданный API ключ
        """
        db_obj = APIKey(
            user_id=user_id,
            exchange=obj_in.exchange,
            api_key=obj_in.api_key,
            api_secret=obj_in.api_secret,
            passphrase=obj_in.passphrase,
            label=obj_in.label,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: APIKey,
        obj_in: Union[APIKeyUpdate, Dict[str, Any]]
    ) -> APIKey:
        """
        Обновление API ключа.
        
        Args:
            db: Сессия базы данных
            db_obj: API ключ для обновления
            obj_in: Данные для обновления
            
        Returns:
            APIKey: Обновленный API ключ
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def update_last_used(self, db: Session, *, db_obj: APIKey) -> APIKey:
        """
        Обновление времени последнего использования.
        
        Args:
            db: Сессия базы данных
            db_obj: API ключ для обновления
            
        Returns:
            APIKey: Обновленный API ключ
        """
        db_obj.last_used = datetime.utcnow()
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def is_expired(self, db_obj: APIKey) -> bool:
        """
        Проверка срока действия ключа.
        
        Args:
            db_obj: API ключ для проверки
            
        Returns:
            bool: True если ключ истек
        """
        if not db_obj.expires_at:
            return False
        return datetime.utcnow() > db_obj.expires_at

api_key = CRUDAPIKey(APIKey) 