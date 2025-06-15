from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....crud import api_key as crud_api_key
from ....schemas.api_key import APIKey, APIKeyCreate, APIKeyUpdate
from ....schemas.user import User
from ....api import deps

router = APIRouter()

@router.get("/", response_model=List[APIKey])
def read_api_keys(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение списка API ключей пользователя.
    """
    api_keys = crud_api_key.api_key.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return api_keys

@router.get("/{api_key_id}", response_model=APIKey)
def read_api_key(
    *,
    db: Session = Depends(deps.get_db),
    api_key_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение API ключа по ID.
    """
    api_key = crud_api_key.api_key.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API ключ не найден"
        )
    if api_key.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    return api_key

@router.post("/", response_model=APIKey)
def create_api_key(
    *,
    db: Session = Depends(deps.get_db),
    api_key_in: APIKeyCreate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Создание нового API ключа.
    """
    api_key = crud_api_key.api_key.create(
        db, obj_in=api_key_in, user_id=current_user.id
    )
    return api_key

@router.put("/{api_key_id}", response_model=APIKey)
def update_api_key(
    *,
    db: Session = Depends(deps.get_db),
    api_key_id: int,
    api_key_in: APIKeyUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Обновление API ключа.
    """
    api_key = crud_api_key.api_key.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API ключ не найден"
        )
    if api_key.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    api_key = crud_api_key.api_key.update(
        db, db_obj=api_key, obj_in=api_key_in
    )
    return api_key

@router.delete("/{api_key_id}", response_model=APIKey)
def delete_api_key(
    *,
    db: Session = Depends(deps.get_db),
    api_key_id: int,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Удаление API ключа.
    """
    api_key = crud_api_key.api_key.get(db, id=api_key_id)
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API ключ не найден"
        )
    if api_key.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно прав для выполнения операции"
        )
    api_key = crud_api_key.api_key.remove(db, id=api_key_id)
    return api_key

@router.get("/exchange/{exchange}", response_model=List[APIKey])
def read_api_keys_by_exchange(
    *,
    db: Session = Depends(deps.get_db),
    exchange: str,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Получение API ключей для конкретной биржи.
    """
    api_keys = crud_api_key.api_key.get_by_exchange(
        db, user_id=current_user.id, exchange=exchange, skip=skip, limit=limit
    )
    return api_keys 