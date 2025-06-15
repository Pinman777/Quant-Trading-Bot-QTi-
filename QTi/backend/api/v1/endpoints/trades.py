from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....crud import trade as crud_trade
from ....schemas.trade import Trade, TradeCreate, TradeUpdate
from ....schemas.user import User
from ....api import deps

router = APIRouter()

@router.get("/", response_model=List[Trade])
def read_trades(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение списка сделок пользователя.
    """
    trades = crud_trade.trade.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return trades

@router.get("/{trade_id}", response_model=Trade)
def read_trade(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение сделки по ID.
    """
    trade = crud_trade.trade.get(db, id=trade_id)
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сделка не найдена"
        )
    if trade.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    return trade

@router.post("/", response_model=Trade)
def create_trade(
    *,
    db: Session = Depends(deps.get_db),
    trade_in: TradeCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Создание новой сделки.
    """
    trade = crud_trade.trade.create(
        db, obj_in=trade_in, user_id=current_user.id
    )
    return trade

@router.put("/{trade_id}", response_model=Trade)
def update_trade(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: int,
    trade_in: TradeUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление сделки.
    """
    trade = crud_trade.trade.get(db, id=trade_id)
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сделка не найдена"
        )
    if trade.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    trade = crud_trade.trade.update(
        db, db_obj=trade, obj_in=trade_in
    )
    return trade

@router.delete("/{trade_id}", response_model=Trade)
def delete_trade(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Удаление сделки.
    """
    trade = crud_trade.trade.get(db, id=trade_id)
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сделка не найдена"
        )
    if trade.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    trade = crud_trade.trade.remove(db, id=trade_id)
    return trade

@router.put("/{trade_id}/status", response_model=Trade)
def update_trade_status(
    *,
    db: Session = Depends(deps.get_db),
    trade_id: int,
    status: str,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление статуса сделки.
    """
    trade = crud_trade.trade.get(db, id=trade_id)
    if not trade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сделка не найдена"
        )
    if trade.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    trade = crud_trade.trade.update_status(
        db, db_obj=trade, status=status
    )
    return trade

@router.get("/strategy/{strategy_id}", response_model=List[Trade])
def read_trades_by_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение сделок для конкретной стратегии.
    """
    trades = crud_trade.trade.get_by_strategy(
        db, user_id=current_user.id, strategy_id=strategy_id, skip=skip, limit=limit
    )
    return trades

@router.get("/exchange/{exchange_id}", response_model=List[Trade])
def read_trades_by_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение сделок для конкретной биржи.
    """
    trades = crud_trade.trade.get_by_exchange(
        db, user_id=current_user.id, exchange_id=exchange_id, skip=skip, limit=limit
    )
    return trades

@router.get("/symbol/{symbol}", response_model=List[Trade])
def read_trades_by_symbol(
    *,
    db: Session = Depends(deps.get_db),
    symbol: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение сделок для конкретного символа.
    """
    trades = crud_trade.trade.get_by_symbol(
        db, user_id=current_user.id, symbol=symbol, skip=skip, limit=limit
    )
    return trades

@router.get("/date-range", response_model=List[Trade])
def read_trades_by_date_range(
    *,
    db: Session = Depends(deps.get_db),
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение сделок за период.
    """
    trades = crud_trade.trade.get_by_date_range(
        db, user_id=current_user.id, start_date=start_date, end_date=end_date,
        skip=skip, limit=limit
    )
    return trades

@router.get("/statistics", response_model=dict)
def get_trade_statistics(
    *,
    db: Session = Depends(deps.get_db),
    start_date: datetime = None,
    end_date: datetime = None,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение статистики по сделкам.
    """
    statistics = crud_trade.trade.get_statistics(
        db, user_id=current_user.id, start_date=start_date, end_date=end_date
    )
    return statistics 