from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db
from ..models import BotStatus, Bot, BotStats, User
from ..core.qti_bot import QTiBotManager
from ..core.config import settings
from ..core.auth import get_current_user
import asyncio
import json
from pathlib import Path
from datetime import datetime
from ..services.bot_manager import BotManager
from ..logger import bot_logger, api_logger, websocket_logger, log_extra

router = APIRouter(
    prefix="/api/v1/bots",
    tags=["bots"],
    responses={404: {"description": "Not found"}},
)

# Инициализация менеджера ботов
bot_manager = QTiBotManager(settings.BOT_PATH)

# Bot management endpoints
@router.get("/", response_model=List[schemas.BotStatus])
async def get_bots(
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить список всех ботов пользователя"""
    api_logger.info(
        "Getting list of bots",
        extra=log_extra({"user_id": current_user.id})
    )
    
    db_bots = db.query(models.Bot).filter(
        models.Bot.user_id == current_user.id
    ).all()
    
    # Получаем статус каждого бота
    bot_statuses = []
    for bot in db_bots:
        try:
            status = await bot_manager.get_bot_status(bot.name)
            bot_statuses.append(schemas.BotStatus(
                id=bot.id,
                name=bot.name,
                exchange=bot.exchange,
                symbol=bot.symbol,
                strategy=bot.strategy,
                status=status["status"],
                pid=status["pid"],
                uptime=status["uptime"],
                profit=status["profit"],
                created_at=bot.created_at,
                updated_at=bot.updated_at
            ))
            bot_logger.debug(
                "Bot status retrieved",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name,
                    "status": status
                })
            )
        except Exception as e:
            bot_logger.error(
                "Error getting bot status",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name,
                    "error": str(e)
                })
            )
    
    return bot_statuses

@router.post("/", response_model=schemas.BotStatus)
async def create_bot(
    bot: schemas.BotCreate,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать и запустить нового бота"""
    api_logger.info(
        "Creating new bot",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_name": bot.name,
            "exchange": bot.exchange,
            "symbol": bot.symbol,
            "strategy": bot.strategy
        })
    )
    
    # Проверяем существование бота с таким именем
    existing_bot = db.query(models.Bot).filter(
        models.Bot.name == bot.name,
        models.Bot.user_id == current_user.id
    ).first()
    
    if existing_bot:
        api_logger.warning(
            "Bot with this name already exists",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_name": bot.name
            })
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бот с таким именем уже существует"
        )
    
    # Создаем конфигурационный файл
    config_dir = Path(settings.BOT_CONFIG_DIR) / str(current_user.id)
    config_dir.mkdir(parents=True, exist_ok=True)
    
    config_path = config_dir / f"{bot.name}.json"
    with open(config_path, "w") as f:
        json.dump(bot.config, f, indent=2)
    
    bot_logger.info(
        "Bot configuration file created",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_name": bot.name,
            "config_path": str(config_path)
        })
    )
    
    # Создаем запись в базе данных
    db_bot = models.Bot(
        user_id=current_user.id,
        name=bot.name,
        exchange=bot.exchange,
        symbol=bot.symbol,
        strategy=bot.strategy,
        config_path=str(config_path),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_bot)
    db.commit()
    db.refresh(db_bot)
    
    bot_logger.info(
        "Bot record created in database",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_id": db_bot.id,
            "bot_name": bot.name
        })
    )
    
    # Запускаем бота
    try:
        status = await bot_manager.start_bot(bot.name, str(config_path))
        bot_logger.info(
            "Bot started successfully",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": db_bot.id,
                "bot_name": bot.name,
                "status": status
            })
        )
        return schemas.BotStatus(
            id=db_bot.id,
            name=bot.name,
            exchange=bot.exchange,
            symbol=bot.symbol,
            strategy=bot.strategy,
            status=status["status"],
            pid=status["pid"],
            uptime=0.0,
            profit=0.0,
            created_at=db_bot.created_at,
            updated_at=db_bot.updated_at
        )
    except Exception as e:
        bot_logger.error(
            "Error starting bot",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": db_bot.id,
                "bot_name": bot.name,
                "error": str(e)
            })
        )
        # Удаляем запись из базы данных в случае ошибки
        db.delete(db_bot)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запуске бота: {str(e)}"
        )

@router.get("/{bot_id}", response_model=schemas.BotStatus)
async def get_bot(
    bot_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить информацию о конкретном боте"""
    api_logger.info(
        "Getting bot information",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_id": bot_id
        })
    )
    
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        api_logger.warning(
            "Bot not found",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id
            })
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    try:
        status = await bot_manager.get_bot_status(db_bot.name)
        bot_logger.debug(
            "Bot status retrieved",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id,
                "bot_name": db_bot.name,
                "status": status
            })
        )
        return schemas.BotStatus(
            id=db_bot.id,
            name=db_bot.name,
            exchange=db_bot.exchange,
            symbol=db_bot.symbol,
            strategy=db_bot.strategy,
            status=status["status"],
            pid=status["pid"],
            uptime=status["uptime"],
            profit=status["profit"],
            created_at=db_bot.created_at,
            updated_at=db_bot.updated_at
        )
    except Exception as e:
        bot_logger.error(
            "Error getting bot status",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id,
                "bot_name": db_bot.name,
                "error": str(e)
            })
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении статуса бота: {str(e)}"
        )

@router.put("/{bot_id}", response_model=schemas.BotStatus)
async def update_bot(
    bot_id: int,
    bot_update: schemas.BotUpdate,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Обновить конфигурацию бота"""
    api_logger.info(
        "Updating bot configuration",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_id": bot_id
        })
    )
    
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        api_logger.warning(
            "Bot not found",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id
            })
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    # Останавливаем бота, если он запущен
    try:
        status = await bot_manager.get_bot_status(db_bot.name)
        if status["status"] == "running":
            bot_logger.info(
                "Stopping bot before update",
                extra=log_extra({
                    "user_id": current_user.id,
                    "bot_id": bot_id,
                    "bot_name": db_bot.name
                })
            )
            await bot_manager.stop_bot(db_bot.name)
    except Exception as e:
        bot_logger.error(
            "Error stopping bot",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id,
                "bot_name": db_bot.name,
                "error": str(e)
            })
        )
    
    # Обновляем конфигурацию
    config_path = Path(db_bot.config_path)
    with open(config_path, "w") as f:
        json.dump(bot_update.config, f, indent=2)
    
    bot_logger.info(
        "Bot configuration updated",
        extra=log_extra({
            "user_id": current_user.id,
            "bot_id": bot_id,
            "bot_name": db_bot.name,
            "config_path": str(config_path)
        })
    )
    
    # Обновляем запись в базе данных
    for key, value in bot_update.dict(exclude_unset=True).items():
        if key != "config":
            setattr(db_bot, key, value)
    
    db_bot.updated_at = datetime.now()
    db.commit()
    db.refresh(db_bot)
    
    # Перезапускаем бота
    try:
        status = await bot_manager.start_bot(db_bot.name, str(config_path))
        bot_logger.info(
            "Bot restarted after update",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id,
                "bot_name": db_bot.name,
                "status": status
            })
        )
        return schemas.BotStatus(
            id=db_bot.id,
            name=db_bot.name,
            exchange=db_bot.exchange,
            symbol=db_bot.symbol,
            strategy=db_bot.strategy,
            status=status["status"],
            pid=status["pid"],
            uptime=status["uptime"],
            profit=status["profit"],
            created_at=db_bot.created_at,
            updated_at=db_bot.updated_at
        )
    except Exception as e:
        bot_logger.error(
            "Error restarting bot after update",
            extra=log_extra({
                "user_id": current_user.id,
                "bot_id": bot_id,
                "bot_name": db_bot.name,
                "error": str(e)
            })
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при перезапуске бота: {str(e)}"
        )

@router.delete("/{bot_id}")
async def delete_bot(
    bot_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить бота"""
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    # Останавливаем бота, если он запущен
    status = await bot_manager.get_bot_status(db_bot.name)
    if status["status"] == "running":
        await bot_manager.stop_bot(db_bot.name)
    
    # Удаляем конфигурационный файл
    config_path = Path(db_bot.config_path)
    if config_path.exists():
        config_path.unlink()
    
    # Удаляем запись из базы данных
    db.delete(db_bot)
    db.commit()
    
    return {"message": "Бот успешно удален"}

@router.post("/{bot_id}/start")
async def start_bot(
    bot_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Запустить бота"""
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    status = await bot_manager.get_bot_status(db_bot.name)
    if status["status"] == "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бот уже запущен"
        )
    
    try:
        await bot_manager.start_bot(db_bot.name, db_bot.config_path)
        return {"message": "Бот успешно запущен"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запуске бота: {str(e)}"
        )

@router.post("/{bot_id}/stop")
async def stop_bot(
    bot_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Остановить бота"""
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    status = await bot_manager.get_bot_status(db_bot.name)
    if status["status"] != "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бот не запущен"
        )
    
    try:
        await bot_manager.stop_bot(db_bot.name)
        return {"message": "Бот успешно остановлен"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при остановке бота: {str(e)}"
        )

@router.get("/{bot_id}/logs")
async def get_bot_logs(
    bot_id: int,
    limit: int = 100,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить логи бота"""
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    # TODO: Реализовать получение логов из файла
    return {"message": "Функция получения логов будет реализована позже"}

# WebSocket endpoint for bot status updates
@router.websocket("/ws/{bot_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    bot_id: int,
    db: Session = Depends(get_db)
):
    await websocket.accept()
    try:
        while True:
            # TODO: Implement actual bot status monitoring
            bot = crud.get_bot(db, bot_id)
            if not bot:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                break
            
            await websocket.send_json({
                "type": "bot_status",
                "data": {
                    "bot_id": bot.id,
                    "status": bot.status,
                    "last_update": bot.updated_at.isoformat() if bot.updated_at else None
                }
            })
            await asyncio.sleep(1)  # Update every second
    except WebSocketDisconnect:
        pass

@router.post("/bots/", response_model=schemas.BotResponse)
async def create_bot(
    bot: schemas.BotCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = models.Bot(
        name=bot.name,
        exchange=bot.exchange,
        symbol=bot.symbol,
        config=bot.config,
        status="stopped",
        user_id=current_user.id
    )
    db.add(db_bot)
    db.commit()
    db.refresh(db_bot)
    return db_bot

@router.get("/bots/", response_model=List[schemas.BotResponse])
async def get_bots(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return db.query(models.Bot).filter(models.Bot.user_id == current_user.id).all()

@router.get("/bots/{bot_id}", response_model=schemas.BotResponse)
async def get_bot(
    bot_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return bot

@router.put("/bots/{bot_id}", response_model=schemas.BotResponse)
async def update_bot(
    bot_id: int,
    bot_update: schemas.BotUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not db_bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    for field, value in bot_update.dict(exclude_unset=True).items():
        setattr(db_bot, field, value)
    
    db.commit()
    db.refresh(db_bot)
    return db_bot

@router.delete("/bots/{bot_id}")
async def delete_bot(
    bot_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not db_bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    db.delete(db_bot)
    db.commit()
    return {"message": "Bot deleted successfully"}

@router.post("/bots/{bot_id}/start")
async def start_bot(
    bot_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not db_bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    if db_bot.status == "running":
        raise HTTPException(status_code=400, detail="Bot is already running")
    
    try:
        await bot_manager.start_bot(db_bot)
        db_bot.status = "running"
        db.commit()
        return {"message": "Bot started successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bots/{bot_id}/stop")
async def stop_bot(
    bot_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not db_bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    if db_bot.status != "running":
        raise HTTPException(status_code=400, detail="Bot is not running")
    
    try:
        await bot_manager.stop_bot(db_bot)
        db_bot.status = "stopped"
        db.commit()
        return {"message": "Bot stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bots/{bot_id}/stats", response_model=List[schemas.BotStatsResponse])
async def get_bot_stats(
    bot_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    if not db_bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    stats = db.query(models.BotStats).filter(
        models.BotStats.bot_id == bot_id
    ).order_by(models.BotStats.timestamp.desc()).limit(limit).all()
    
    return stats

@router.get("/version")
async def get_bot_version(current_user = Depends(get_current_user)):
    """Получить версию QTi Bot"""
    version = await bot_manager.get_version()
    return {"version": version}

@router.get("/config")
async def get_bot_config(current_user = Depends(get_current_user)):
    """Получить конфигурацию QTi Bot"""
    config = await bot_manager.get_config()
    return config

@router.put("/config")
async def update_bot_config(
    config: Dict[str, Any],
    current_user = Depends(get_current_user)
):
    """Обновить конфигурацию QTi Bot"""
    success = await bot_manager.update_config(config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update config")
    return {"status": "success"}

@router.post("/start")
async def start_bot(current_user = Depends(get_current_user)):
    """Запустить QTi Bot"""
    success = await bot_manager.start()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to start bot")
    return {"status": "success"}

@router.post("/stop")
async def stop_bot(current_user = Depends(get_current_user)):
    """Остановить QTi Bot"""
    success = await bot_manager.stop()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to stop bot")
    return {"status": "success"}

@router.get("/status")
async def get_bot_status(current_user = Depends(get_current_user)):
    """Получить статус QTi Bot"""
    status = await bot_manager.get_status()
    return status

@router.get("/logs")
async def get_bot_logs(
    limit: int = 100,
    level: str = None,
    current_user = Depends(get_current_user)
):
    """Получить логи QTi Bot"""
    logs = await bot_manager.get_logs(limit, level)
    return {"logs": logs} 