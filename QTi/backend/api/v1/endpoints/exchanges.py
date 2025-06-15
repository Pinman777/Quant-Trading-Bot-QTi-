from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....crud import exchange as crud_exchange
from ....schemas.exchange import Exchange, ExchangeCreate, ExchangeUpdate
from ....schemas.user import User
from ....api import deps

router = APIRouter()

@router.get("/", response_model=List[Exchange])
def read_exchanges(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение списка бирж пользователя.
    """
    exchanges = crud_exchange.exchange.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return exchanges

@router.get("/{exchange_id}", response_model=Exchange)
def read_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение биржи по ID.
    """
    exchange = crud_exchange.exchange.get(db, id=exchange_id)
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Биржа не найдена"
        )
    if exchange.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    return exchange

@router.post("/", response_model=Exchange)
def create_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_in: ExchangeCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Создание новой биржи.
    """
    exchange = crud_exchange.exchange.get_by_name(
        db, user_id=current_user.id, name=exchange_in.name
    )
    if exchange:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Биржа с таким названием уже существует"
        )
    exchange = crud_exchange.exchange.create(
        db, obj_in=exchange_in, user_id=current_user.id
    )
    return exchange

@router.put("/{exchange_id}", response_model=Exchange)
def update_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    exchange_in: ExchangeUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление биржи.
    """
    exchange = crud_exchange.exchange.get(db, id=exchange_id)
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Биржа не найдена"
        )
    if exchange.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    exchange = crud_exchange.exchange.update(
        db, db_obj=exchange, obj_in=exchange_in
    )
    return exchange

@router.delete("/{exchange_id}", response_model=Exchange)
def delete_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Удаление биржи.
    """
    exchange = crud_exchange.exchange.get(db, id=exchange_id)
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Биржа не найдена"
        )
    if exchange.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    exchange = crud_exchange.exchange.remove(db, id=exchange_id)
    return exchange

@router.put("/{exchange_id}/status", response_model=Exchange)
def update_exchange_status(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    is_active: bool,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление статуса биржи.
    """
    exchange = crud_exchange.exchange.get(db, id=exchange_id)
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Биржа не найдена"
        )
    if exchange.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    exchange = crud_exchange.exchange.update_status(
        db, db_obj=exchange, is_active=is_active
    )
    return exchange

@router.put("/{exchange_id}/balance", response_model=Exchange)
def update_exchange_balance(
    *,
    db: Session = Depends(deps.get_db),
    exchange_id: int,
    balance: dict,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление баланса биржи.
    """
    exchange = crud_exchange.exchange.get(db, id=exchange_id)
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Биржа не найдена"
        )
    if exchange.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    exchange = crud_exchange.exchange.update_balance(
        db, db_obj=exchange, balance=balance
    )
    return exchange 