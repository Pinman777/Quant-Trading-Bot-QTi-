from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from .. import schemas, models, security
from ..database import get_db
from ..config import settings
import json
from pathlib import Path
import logging
from datetime import datetime

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.get("/", response_model=schemas.UserSettings)
async def get_settings(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить настройки пользователя"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if db_settings is None:
        # Создаем настройки по умолчанию
        db_settings = models.UserSettings(
            user_id=current_user.id,
            theme="dark",
            notifications=True,
            auto_refresh=True,
            refresh_interval=30,
            default_exchange="binance",
            default_symbol="BTCUSDT",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(db_settings)
        db.commit()
        db.refresh(db_settings)
    
    return db_settings

@router.put("/", response_model=schemas.UserSettings)
async def update_settings(
    settings_update: schemas.UserSettingsUpdate,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить настройки пользователя"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if db_settings is None:
        db_settings = models.UserSettings(user_id=current_user.id)
        db.add(db_settings)
    
    for key, value in settings_update.dict(exclude_unset=True).items():
        setattr(db_settings, key, value)
    
    db_settings.updated_at = datetime.now()
    db.commit()
    db.refresh(db_settings)
    return db_settings

@router.get("/api-keys", response_model=Dict[str, Any])
async def get_api_keys(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить API ключи пользователя"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Настройки пользователя не найдены"
        )
    
    return {
        "binance": {
            "api_key": db_settings.binance_api_key,
            "api_secret": "********" if db_settings.binance_api_secret else None
        },
        "bybit": {
            "api_key": db_settings.bybit_api_key,
            "api_secret": "********" if db_settings.bybit_api_secret else None
        },
        "okx": {
            "api_key": db_settings.okx_api_key,
            "api_secret": "********" if db_settings.okx_api_secret else None
        }
    }

@router.put("/api-keys/{exchange}")
async def update_api_keys(
    exchange: str,
    api_keys: schemas.ExchangeAPIKeys,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить API ключи для биржи"""
    if exchange not in ["binance", "bybit", "okx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неподдерживаемая биржа"
        )
    
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        db_settings = models.UserSettings(user_id=current_user.id)
        db.add(db_settings)
    
    setattr(db_settings, f"{exchange}_api_key", api_keys.api_key)
    setattr(db_settings, f"{exchange}_api_secret", api_keys.api_secret)
    
    db_settings.updated_at = datetime.now()
    db.commit()
    db.refresh(db_settings)
    
    return {"message": f"API ключи для {exchange} обновлены"}

@router.get("/notifications", response_model=schemas.NotificationSettings)
async def get_notification_settings(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить настройки уведомлений"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Настройки пользователя не найдены"
        )
    
    return schemas.NotificationSettings(
        email_notifications=db_settings.email_notifications,
        telegram_notifications=db_settings.telegram_notifications,
        telegram_chat_id=db_settings.telegram_chat_id,
        notification_types=db_settings.notification_types
    )

@router.put("/notifications", response_model=schemas.NotificationSettings)
async def update_notification_settings(
    notification_settings: schemas.NotificationSettings,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить настройки уведомлений"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        db_settings = models.UserSettings(user_id=current_user.id)
        db.add(db_settings)
    
    for key, value in notification_settings.dict(exclude_unset=True).items():
        setattr(db_settings, key, value)
    
    db_settings.updated_at = datetime.now()
    db.commit()
    db.refresh(db_settings)
    
    return notification_settings

@router.get("/theme", response_model=schemas.ThemeSettings)
async def get_theme_settings(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить настройки темы"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Настройки пользователя не найдены"
        )
    
    return schemas.ThemeSettings(
        theme=db_settings.theme,
        chart_theme=db_settings.chart_theme,
        custom_colors=db_settings.custom_colors
    )

@router.put("/theme", response_model=schemas.ThemeSettings)
async def update_theme_settings(
    theme_settings: schemas.ThemeSettings,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить настройки темы"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        db_settings = models.UserSettings(user_id=current_user.id)
        db.add(db_settings)
    
    for key, value in theme_settings.dict(exclude_unset=True).items():
        setattr(db_settings, key, value)
    
    db_settings.updated_at = datetime.now()
    db.commit()
    db.refresh(db_settings)
    
    return theme_settings

@router.post("/export")
async def export_settings(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Экспортировать настройки пользователя"""
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not db_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Настройки пользователя не найдены"
        )
    
    # Создаем директорию для экспорта, если её нет
    export_dir = Path("./data/exports")
    export_dir.mkdir(parents=True, exist_ok=True)
    
    # Формируем имя файла с датой
    filename = f"settings_{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = export_dir / filename
    
    # Экспортируем настройки в JSON
    settings_dict = {
        "user_id": db_settings.user_id,
        "theme": db_settings.theme,
        "notifications": db_settings.notifications,
        "auto_refresh": db_settings.auto_refresh,
        "refresh_interval": db_settings.refresh_interval,
        "default_exchange": db_settings.default_exchange,
        "default_symbol": db_settings.default_symbol,
        "notification_settings": {
            "email_notifications": db_settings.email_notifications,
            "telegram_notifications": db_settings.telegram_notifications,
            "telegram_chat_id": db_settings.telegram_chat_id,
            "notification_types": db_settings.notification_types
        },
        "theme_settings": {
            "theme": db_settings.theme,
            "chart_theme": db_settings.chart_theme,
            "custom_colors": db_settings.custom_colors
        },
        "exported_at": datetime.now().isoformat()
    }
    
    with open(filepath, "w") as f:
        json.dump(settings_dict, f, indent=2)
    
    return {"message": "Настройки экспортированы", "filename": filename}

@router.post("/import")
async def import_settings(
    background_tasks: BackgroundTasks,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Импортировать настройки пользователя"""
    # Здесь будет логика импорта настроек из файла
    # Пока что это заглушка
    return {"message": "Функция импорта настроек будет реализована позже"}

@router.get("/servers", response_model=List[schemas.Server])
def get_servers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Получить список серверов"""
    servers = db.query(models.Server).offset(skip).limit(limit).all()
    return servers

@router.post("/servers", response_model=schemas.Server, status_code=status.HTTP_201_CREATED)
def create_server(
    server: schemas.ServerCreate,
    db: Session = Depends(get_db)
):
    """Создать новый сервер"""
    db_server = models.Server(**server.dict())
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    return db_server

@router.get("/servers/{server_id}", response_model=schemas.Server)
def get_server(
    server_id: int,
    db: Session = Depends(get_db)
):
    """Получить сервер по ID"""
    server = db.query(models.Server).filter(models.Server.id == server_id).first()
    if server is None:
        raise HTTPException(status_code=404, detail="Server not found")
    return server

@router.put("/servers/{server_id}", response_model=schemas.Server)
def update_server(
    server_id: int,
    server: schemas.ServerUpdate,
    db: Session = Depends(get_db)
):
    """Обновить сервер"""
    db_server = db.query(models.Server).filter(models.Server.id == server_id).first()
    if db_server is None:
        raise HTTPException(status_code=404, detail="Server not found")
    
    for key, value in server.dict(exclude_unset=True).items():
        setattr(db_server, key, value)
    
    db.commit()
    db.refresh(db_server)
    return db_server

@router.delete("/servers/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(
    server_id: int,
    db: Session = Depends(get_db)
):
    """Удалить сервер"""
    server = db.query(models.Server).filter(models.Server.id == server_id).first()
    if server is None:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.delete(server)
    db.commit()
    return None 