from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....crud import strategy as crud_strategy
from ....schemas.strategy import Strategy, StrategyCreate, StrategyUpdate
from ....schemas.user import User
from ....api import deps

router = APIRouter()

@router.get("/", response_model=List[Strategy])
def read_strategies(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение списка стратегий пользователя.
    """
    strategies = crud_strategy.strategy.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return strategies

@router.get("/{strategy_id}", response_model=Strategy)
def read_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение стратегии по ID.
    """
    strategy = crud_strategy.strategy.get(db, id=strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стратегия не найдена"
        )
    if strategy.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    return strategy

@router.post("/", response_model=Strategy)
def create_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_in: StrategyCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Создание новой стратегии.
    """
    strategy = crud_strategy.strategy.get_by_name(
        db, user_id=current_user.id, name=strategy_in.name
    )
    if strategy:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Стратегия с таким названием уже существует"
        )
    strategy = crud_strategy.strategy.create(
        db, obj_in=strategy_in, user_id=current_user.id
    )
    return strategy

@router.put("/{strategy_id}", response_model=Strategy)
def update_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    strategy_in: StrategyUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление стратегии.
    """
    strategy = crud_strategy.strategy.get(db, id=strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стратегия не найдена"
        )
    if strategy.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    strategy = crud_strategy.strategy.update(
        db, db_obj=strategy, obj_in=strategy_in
    )
    return strategy

@router.delete("/{strategy_id}", response_model=Strategy)
def delete_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Удаление стратегии.
    """
    strategy = crud_strategy.strategy.get(db, id=strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стратегия не найдена"
        )
    if strategy.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    strategy = crud_strategy.strategy.remove(db, id=strategy_id)
    return strategy

@router.put("/{strategy_id}/status", response_model=Strategy)
def update_strategy_status(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    is_active: bool,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление статуса стратегии.
    """
    strategy = crud_strategy.strategy.get(db, id=strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стратегия не найдена"
        )
    if strategy.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    strategy = crud_strategy.strategy.update_status(
        db, db_obj=strategy, is_active=is_active
    )
    return strategy

@router.put("/{strategy_id}/performance", response_model=Strategy)
def update_strategy_performance(
    *,
    db: Session = Depends(deps.get_db),
    strategy_id: int,
    performance: dict,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление показателей стратегии.
    """
    strategy = crud_strategy.strategy.get(db, id=strategy_id)
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Стратегия не найдена"
        )
    if strategy.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    strategy = crud_strategy.strategy.update_performance(
        db, db_obj=strategy, performance=performance
    )
    return strategy

@router.get("/exchange/{exchange_id}", response_model=List[Strategy])
def read_strategies_by_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение стратегий для конкретной биржи.
    """
    strategies = crud_strategy.strategy.get_by_exchange(
        db, user_id=current_user.id, exchange_id=exchange_id, skip=skip, limit=limit
    )
    return strategies 