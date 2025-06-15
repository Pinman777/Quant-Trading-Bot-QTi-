from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from ..core.monitor import Monitor
from ..core.config import ConfigManager

router = APIRouter()
config_manager = ConfigManager()
monitor = Monitor(config_manager)

class MonitorParams(BaseModel):
    bot_name: str
    config_path: str

class BotStatus(BaseModel):
    name: str
    status: str
    start_time: str
    end_time: Optional[str] = None
    metrics: Dict[str, Any]
    recent_trades: List[Dict[str, Any]]

@router.post("/monitor/start", response_model=BotStatus)
async def start_monitoring(params: MonitorParams):
    """Запуск мониторинга бота"""
    success = await monitor.start_monitoring(
        params.bot_name,
        params.config_path
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Бот уже находится под мониторингом"
        )
    
    return monitor.get_bot_status(params.bot_name)

@router.post("/monitor/{bot_name}/stop")
async def stop_monitoring(bot_name: str):
    """Остановка мониторинга бота"""
    success = await monitor.stop_monitoring(bot_name)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Бот не найден"
        )
    return {"message": "Мониторинг остановлен"}

@router.get("/monitor/{bot_name}", response_model=BotStatus)
async def get_bot_status(bot_name: str):
    """Получение статуса бота"""
    status = monitor.get_bot_status(bot_name)
    if not status:
        raise HTTPException(
            status_code=404,
            detail="Бот не найден"
        )
    return status

@router.get("/monitor", response_model=List[BotStatus])
async def get_all_bots_status():
    """Получение статуса всех ботов"""
    return monitor.get_all_bots_status()

@router.get("/monitor/{bot_name}/trades")
async def get_trade_history(bot_name: str, limit: int = 100):
    """Получение истории сделок бота"""
    if bot_name not in monitor.active_bots:
        raise HTTPException(
            status_code=404,
            detail="Бот не найден"
        )
    return monitor.get_trade_history(bot_name, limit) 