from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from ..models.exchange import Exchange
from ..schemas.exchange import ExchangeCreate, ExchangeUpdate
from .base import CRUDBase

class CRUDExchange(CRUDBase[Exchange, ExchangeCreate, ExchangeUpdate]):
    """
    CRUD операции для бирж.
    """
    def get_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Exchange]:
        """
        Получение бирж пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Exchange]: Список бирж
        """
        return (
            db.query(self.model)
            .filter(Exchange.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_name(
        self,
        db: Session,
        *,
        user_id: int,
        name: str
    ) -> Optional[Exchange]:
        """
        Получение биржи по названию.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            name: Название биржи
            
        Returns:
            Optional[Exchange]: Биржа или None
        """
        return (
            db.query(self.model)
            .filter(
                Exchange.user_id == user_id,
                Exchange.name == name
            )
            .first()
        )

    def create(self, db: Session, *, obj_in: ExchangeCreate, user_id: int) -> Exchange:
        """
        Создание биржи.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            user_id: ID пользователя
            
        Returns:
            Exchange: Созданная биржа
        """
        db_obj = Exchange(
            user_id=user_id,
            name=obj_in.name,
            description=obj_in.description,
            is_active=obj_in.is_active,
            config=obj_in.config
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Exchange,
        obj_in: Union[ExchangeUpdate, Dict[str, Any]]
    ) -> Exchange:
        """
        Обновление биржи.
        
        Args:
            db: Сессия базы данных
            db_obj: Биржа для обновления
            obj_in: Данные для обновления
            
        Returns:
            Exchange: Обновленная биржа
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def update_balance(
        self,
        db: Session,
        *,
        db_obj: Exchange,
        balance: Dict[str, float]
    ) -> Exchange:
        """
        Обновление баланса биржи.
        
        Args:
            db: Сессия базы данных
            db_obj: Биржа для обновления
            balance: Новый баланс
            
        Returns:
            Exchange: Обновленная биржа
        """
        db_obj.balance = balance
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_status(
        self,
        db: Session,
        *,
        db_obj: Exchange,
        is_active: bool
    ) -> Exchange:
        """
        Обновление статуса биржи.
        
        Args:
            db: Сессия базы данных
            db_obj: Биржа для обновления
            is_active: Новый статус
            
        Returns:
            Exchange: Обновленная биржа
        """
        db_obj.is_active = is_active
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

exchange = CRUDExchange(Exchange) 