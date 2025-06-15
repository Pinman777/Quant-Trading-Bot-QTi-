from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional, Dict
import uvicorn
import json
import asyncio
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

from routers import bots, backtest, optimize, settings, auth, servers, market
from database import engine, Base
from core.config import settings as app_settings
from core.security import get_current_user
from models.bot import BotStatus
from api.routes import remote_sync
from api import alerts, exchanges, bots, market, backtest, optimizer, config, monitor, websocket, remote
from logger import server_logger, api_logger, websocket_logger, log_extra
from .core.config import settings
from .core.logger import logger
from .core.database import init_db
from .api.v1.api import api_router

# Load environment variables
load_dotenv()

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="QTi - Торговый бот для криптовалютных бирж",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Хранилище активных WebSocket соединений
active_connections: Dict[str, WebSocket] = {}

# Models
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Security functions
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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # TODO: Get user from database
    user = None  # Replace with actual database query
    if user is None:
        raise credentials_exception
    return user

# Подключаем роутеры
app.include_router(bots.router, prefix="/api", tags=["bots"])
app.include_router(backtest.router, prefix="/api", tags=["backtest"])
app.include_router(optimize.router, prefix="/api", tags=["optimize"])
app.include_router(settings.router, prefix="/api", tags=["settings"])
app.include_router(auth.router, prefix="/api")
app.include_router(servers.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(remote_sync.router)
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
app.include_router(exchanges.router, prefix="/api/v1", tags=["exchanges"])
app.include_router(optimizer.router, prefix="/api/v1", tags=["optimizer"])
app.include_router(config.router, prefix="/api/v1", tags=["config"])
app.include_router(monitor.router, prefix="/api/v1", tags=["monitor"])
app.include_router(websocket.router, prefix="/api/v1", tags=["websocket"])
app.include_router(remote.router, prefix="/api/v1", tags=["remote"])

async def broadcast_message(message: dict):
    """Отправка сообщения всем подключенным клиентам"""
    for connection in active_connections.values():
        try:
            await connection.send_json(message)
            websocket_logger.debug(
                "Message broadcasted successfully",
                extra=log_extra({"message": message})
            )
        except Exception as e:
            websocket_logger.error(
                "Error broadcasting message",
                extra=log_extra({"error": str(e), "message": message})
            )

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint для real-time обновлений"""
    await websocket.accept()
    client_id = str(id(websocket))
    active_connections[client_id] = websocket
    
    websocket_logger.info(
        "New WebSocket connection established",
        extra=log_extra({"client_id": client_id})
    )
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                websocket_logger.debug(
                    "Received WebSocket message",
                    extra=log_extra({"message": message})
                )
                
                # Обработка различных типов сообщений
                if message.get("type") == "get_remotes":
                    # Отправляем список удаленных серверов
                    await websocket.send_json({
                        "type": "remotes_list",
                        "timestamp": datetime.utcnow().isoformat(),
                        "servers": []  # TODO: Получить реальный список серверов
                    })
                elif message.get("type") == "bot_action":
                    # Обработка действий с ботом
                    bot_name = message.get("bot_name")
                    action = message.get("action")
                    if bot_name and action:
                        # TODO: Выполнить действие с ботом
                        await broadcast_message({
                            "type": "bot_status",
                            "timestamp": datetime.utcnow().isoformat(),
                            "bot_name": bot_name,
                            "status": {
                                "name": bot_name,
                                "status": "running" if action == "start" else "stopped",
                                "pid": None,
                                "uptime": None,
                                "profit": None
                            }
                        })
                
            except json.JSONDecodeError:
                websocket_logger.error(
                    "Invalid JSON received",
                    extra=log_extra({"data": data})
                )
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
                
    except WebSocketDisconnect:
        websocket_logger.info(
            "WebSocket connection closed",
            extra=log_extra({"client_id": client_id})
        )
        del active_connections[client_id]

@app.get("/")
async def root():
    """
    Корневой эндпоинт для проверки работоспособности.
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    server_logger.info(
        "Health check endpoint accessed",
        extra=log_extra({"endpoint": "/health"})
    )
    return {"status": "healthy"}

@app.get("/api/v1/health")
async def api_health_check():
    """Проверка здоровья API"""
    api_logger.info(
        "API health check endpoint accessed",
        extra=log_extra({"endpoint": "/api/v1/health"})
    )
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/system/info")
async def system_info():
    """Информация о системе"""
    server_logger.info("System info requested")
    return {
        "system": {
            "platform": os.name,
            "python_version": os.sys.version,
            "cpu_count": os.cpu_count(),
            "memory": {
                "total": None,  # TODO: Add memory info
                "available": None
            }
        },
        "app": {
            "version": "1.0.0",
            "start_time": datetime.utcnow().isoformat(),
            "active_connections": len(active_connections)
        }
    }

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Аутентификация пользователя и получение токена"""
    api_logger.info(
        "Login attempt",
        extra=log_extra({"username": form_data.username})
    )
    # TODO: Authenticate user against database
    user = None  # Replace with actual database query
    if not user or not verify_password(form_data.password, user.hashed_password):
        api_logger.warning(
            "Failed login attempt",
            extra=log_extra({"username": form_data.username})
        )
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    api_logger.info(
        "Successful login",
        extra=log_extra({"username": form_data.username})
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    """Создание нового пользователя"""
    api_logger.info(
        "User creation attempt",
        extra=log_extra({"username": user.username, "email": user.email})
    )
    # TODO: Check if user exists
    # TODO: Create user in database
    return user

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    api_logger.info(
        "User info requested",
        extra=log_extra({"username": current_user.username})
    )
    return current_user

# Обработка ошибок
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc)},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP error: {exc}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

@app.on_event("startup")
async def startup_event():
    """
    Действия при запуске приложения.
    """
    logger.info("Starting up QTi application...")
    try:
        # Инициализация базы данных
        init_db()
        logger.info("Database initialized successfully")
        
        # Дополнительные действия при запуске
        # ...
        
        logger.info("QTi application started successfully")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """
    Действия при остановке приложения.
    """
    logger.info("Shutting down QTi application...")
    # Действия при остановке
    # ...

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    ) 