from typing import Generator
from .core.remote_sync import RemoteSync
from .core.market_data import MarketData
from .config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from .database import get_db
from .models import User

load_dotenv()

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_remote_sync() -> Generator[RemoteSync, None, None]:
    """Получить экземпляр RemoteSync"""
    try:
        remote_sync = RemoteSync(config_path=settings.rclone_config_path)
        yield remote_sync
    except Exception as e:
        raise RuntimeError(f"Ошибка инициализации RemoteSync: {e}")

def get_market_data() -> Generator[MarketData, None, None]:
    """Получить экземпляр MarketData"""
    try:
        market_data = MarketData(api_key=settings.coinmarketcap_api_key)
        yield market_data
    except Exception as e:
        raise RuntimeError(f"Ошибка инициализации MarketData: {e}")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 