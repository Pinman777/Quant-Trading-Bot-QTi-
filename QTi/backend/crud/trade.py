from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.trade import Trade
from ..schemas.trade import TradeCreate, TradeUpdate
from .base import CRUDBase

class CRUDTrade(CRUDBase[Trade, TradeCreate, TradeUpdate]):
    """
    CRUD операции для сделок.
    """
    def get_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """
        Получение сделок пользователя.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Trade]: Список сделок
        """
        return (
            db.query(self.model)
            .filter(Trade.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_strategy(
        self,
        db: Session,
        *,
        user_id: int,
        strategy_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """
        Получение сделок для конкретной стратегии.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            strategy_id: ID стратегии
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Trade]: Список сделок
        """
        return (
            db.query(self.model)
            .filter(
                Trade.user_id == user_id,
                Trade.strategy_id == strategy_id
            )
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
    ) -> List[Trade]:
        """
        Получение сделок для конкретной биржи.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            exchange_id: ID биржи
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Trade]: Список сделок
        """
        return (
            db.query(self.model)
            .filter(
                Trade.user_id == user_id,
                Trade.exchange_id == exchange_id
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_symbol(
        self,
        db: Session,
        *,
        user_id: int,
        symbol: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """
        Получение сделок для конкретного символа.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            symbol: Торговый символ
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Trade]: Список сделок
        """
        return (
            db.query(self.model)
            .filter(
                Trade.user_id == user_id,
                Trade.symbol == symbol
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_date_range(
        self,
        db: Session,
        *,
        user_id: int,
        start_date: datetime,
        end_date: datetime,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """
        Получение сделок за период.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            start_date: Начальная дата
            end_date: Конечная дата
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            
        Returns:
            List[Trade]: Список сделок
        """
        return (
            db.query(self.model)
            .filter(
                Trade.user_id == user_id,
                Trade.created_at >= start_date,
                Trade.created_at <= end_date
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in: TradeCreate, user_id: int) -> Trade:
        """
        Создание сделки.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            user_id: ID пользователя
            
        Returns:
            Trade: Созданная сделка
        """
        db_obj = Trade(
            user_id=user_id,
            strategy_id=obj_in.strategy_id,
            exchange_id=obj_in.exchange_id,
            symbol=obj_in.symbol,
            side=obj_in.side,
            type=obj_in.type,
            quantity=obj_in.quantity,
            price=obj_in.price,
            status=obj_in.status,
            metadata=obj_in.metadata
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Trade,
        obj_in: Union[TradeUpdate, Dict[str, Any]]
    ) -> Trade:
        """
        Обновление сделки.
        
        Args:
            db: Сессия базы данных
            db_obj: Сделка для обновления
            obj_in: Данные для обновления
            
        Returns:
            Trade: Обновленная сделка
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
        db_obj: Trade,
        status: str
    ) -> Trade:
        """
        Обновление статуса сделки.
        
        Args:
            db: Сессия базы данных
            db_obj: Сделка для обновления
            status: Новый статус
            
        Returns:
            Trade: Обновленная сделка
        """
        db_obj.status = status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_statistics(
        self,
        db: Session,
        *,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Получение статистики по сделкам.
        
        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            start_date: Начальная дата
            end_date: Конечная дата
            
        Returns:
            Dict[str, Any]: Статистика по сделкам
        """
        query = db.query(self.model).filter(Trade.user_id == user_id)
        
        if start_date:
            query = query.filter(Trade.created_at >= start_date)
        if end_date:
            query = query.filter(Trade.created_at <= end_date)
        
        trades = query.all()
        
        total_trades = len(trades)
        total_volume = sum(trade.quantity * trade.price for trade in trades)
        total_profit = sum(trade.profit for trade in trades if trade.profit is not None)
        
        return {
            "total_trades": total_trades,
            "total_volume": total_volume,
            "total_profit": total_profit,
            "win_rate": sum(1 for t in trades if t.profit and t.profit > 0) / total_trades if total_trades > 0 else 0
        }

trade = CRUDTrade(Trade) 