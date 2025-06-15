from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import crud, schemas
from .database import get_db
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> schemas.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: schemas.User = Depends(get_current_user)
) -> schemas.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[schemas.User]:
    user = crud.get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# Permission checks
def check_bot_ownership(db: Session, bot_id: int, user_id: int) -> bool:
    bot = crud.get_bot(db, bot_id)
    if not bot:
        return False
    return bot.owner_id == user_id

def check_server_config_access(db: Session, config_id: int, user_id: int) -> bool:
    # TODO: Implement proper access control for server configs
    return True

# Rate limiting
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict

# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    def is_rate_limited(self, client_id: str) -> bool:
        now = time.time()
        minute_ago = now - 60

        # Clean old requests
        self.requests[client_id] = [req_time for req_time in self.requests[client_id] if req_time > minute_ago]

        # Check if rate limit is exceeded
        if len(self.requests[client_id]) >= self.requests_per_minute:
            return True

        # Add new request
        self.requests[client_id].append(now)
        return False

rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    client_id = request.client.host
    if rate_limiter.is_rate_limited(client_id):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests"}
        )
    response = await call_next(request)
    return response 