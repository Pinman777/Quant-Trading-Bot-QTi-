from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session
from ..models.strategy import Strategy
from ..schemas.strategy import StrategyCreate, StrategyUpdate
from .base import CRUDBase

class CRUDStrategy(CRUDBase[Strategy, StrategyCreate, StrategyUpdate]):
    """
    CRUD операции для стратегий.
    """
    def get_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Strategy]:
        """
        Получение стратегий пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Strategy]: Список стратегий
        """
        return (
            db.query(self.model)
            .filter(Strategy.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_exchange(
        self,
        db: Session,
        *,
        user_id: int,
        exchange_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Strategy]:
        """
        Получение стратегий для конкретной биржи.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            exchange_id: ID биржи
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Strategy]: Список стратегий
        """
        return (
            db.query(self.model)
            .filter(
                Strategy.user_id == user_id,
                Strategy.exchange_id == exchange_id
            )
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
    ) -> Optional[Strategy]:
        """
        Получение стратегии по названию.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            name: Название стратегии
            
        Returns:
            Optional[Strategy]: Стратегия или None
        """
        return (
            db.query(self.model)
            .filter(
                Strategy.user_id == user_id,
                Strategy.name == name
            )
            .first()
        )

    def create(self, db: Session, *, obj_in: StrategyCreate, user_id: int) -> Strategy:
        """
        Создание стратегии.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            user_id: ID пользователя
            
        Returns:
            Strategy: Созданная стратегия
        """
        db_obj = Strategy(
            user_id=user_id,
            exchange_id=obj_in.exchange_id,
            name=obj_in.name,
            description=obj_in.description,
            type=obj_in.type,
            config=obj_in.config,
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
        db_obj: Strategy,
        obj_in: Union[StrategyUpdate, Dict[str, Any]]
    ) -> Strategy:
        """
        Обновление стратегии.
        
        Args:
            db: Сессия базы данных
            db_obj: Стратегия для обновления
            obj_in: Данные для обновления
            
        Returns:
            Strategy: Обновленная стратегия
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def update_status(
        self,
        db: Session,
        *,
        db_obj: Strategy,
        is_active: bool
    ) -> Strategy:
        """
        Обновление статуса стратегии.
        
        Args:
            db: Сессия базы данных
            db_obj: Стратегия для обновления
            is_active: Новый статус
            
        Returns:
            Strategy: Обновленная стратегия
        """
        db_obj.is_active = is_active
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_performance(
        self,
        db: Session,
        *,
        db_obj: Strategy,
        performance: Dict[str, float]
    ) -> Strategy:
        """
        Обновление показателей стратегии.
        
        Args:
            db: Сессия базы данных
            db_obj: Стратегия для обновления
            performance: Новые показатели
            
        Returns:
            Strategy: Обновленная стратегия
        """
        db_obj.performance = performance
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

strategy = CRUDStrategy(Strategy) 