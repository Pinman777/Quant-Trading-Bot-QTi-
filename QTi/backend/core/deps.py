from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import SessionLocal
from .security import security
from .logger import logger

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_db() -> Generator:
    """
    Зависимость для получения сессии базы данных.
    
    Yields:
        Session: Сессия базы данных
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[dict]:
    """
    Зависимость для получения текущего пользователя.
    
    Args:
        db: Сессия базы данных
        token: JWT токен
        
    Returns:
        Optional[dict]: Данные пользователя
        
    Raises:
        HTTPException: Если токен недействителен или пользователь не найден
    """
    try:
        payload = security.verify_token(token)
        token_type = security.get_token_type(token)
        
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # TODO: Получить пользователя из базы данных
        # user = db.query(User).filter(User.id == user_id).first()
        # if not user:
        #     raise HTTPException(
        #         status_code=status.HTTP_404_NOT_FOUND,
        #         detail="User not found"
        #     )
        
        # return user
        
        # Временное решение для тестирования
        return {"id": user_id}
        
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Зависимость для получения активного пользователя.
    
    Args:
        current_user: Данные текущего пользователя
        
    Returns:
        dict: Данные активного пользователя
        
    Raises:
        HTTPException: Если пользователь неактивен
    """
    # TODO: Проверить активность пользователя
    # if not current_user.is_active:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Inactive user"
    #     )
    
    return current_user

def get_current_superuser(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """
    Зависимость для получения суперпользователя.
    
    Args:
        current_user: Данные текущего пользователя
        
    Returns:
        dict: Данные суперпользователя
        
    Raises:
        HTTPException: Если пользователь не является суперпользователем
    """
    # TODO: Проверить права суперпользователя
    # if not current_user.is_superuser:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="The user doesn't have enough privileges"
    #     )
    
    return current_user 