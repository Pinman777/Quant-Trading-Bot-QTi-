from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from ..core.config_manager import ConfigManager

router = APIRouter()
config_manager = ConfigManager()

class ConfigData(BaseModel):
    name: str
    path: str
    description: Optional[str] = None
    exchange: Optional[str] = None
    symbol: Optional[str] = None

class ConfigContent(BaseModel):
    content: str

class Settings(BaseModel):
    theme: str
    language: str
    update_interval: int

class ApiKeys(BaseModel):
    binance_key: Optional[str] = None
    binance_secret: Optional[str] = None
    bybit_key: Optional[str] = None
    bybit_secret: Optional[str] = None
    okx_key: Optional[str] = None
    okx_secret: Optional[str] = None

@router.get("/configs", response_model=List[str])
async def list_configs():
    """Получение списка всех конфигураций"""
    return config_manager.list_configs()

@router.get("/configs/{name}", response_model=Dict[str, Any])
async def get_config(name: str):
    """Получение конфигурации по имени"""
    config = config_manager.get_config(name)
    if not config:
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    return config

@router.post("/configs")
async def create_config(config: ConfigData):
    """Создание новой конфигурации"""
    if config_manager.get_config(config.name):
        raise HTTPException(status_code=400, detail="Конфигурация уже существует")
    config_manager.save_config(config.name, config.dict())
    return {"message": "Конфигурация создана"}

@router.put("/configs/{name}")
async def update_config(name: str, config: ConfigData):
    """Обновление конфигурации"""
    if not config_manager.get_config(name):
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    config_manager.save_config(name, config.dict())
    return {"message": "Конфигурация обновлена"}

@router.delete("/configs/{name}")
async def delete_config(name: str):
    """Удаление конфигурации"""
    if not config_manager.delete_config(name):
        raise HTTPException(status_code=404, detail="Конфигурация не найдена")
    return {"message": "Конфигурация удалена"}

@router.get("/configs/{name}/content")
async def get_config_content(name: str):
    """Получение содержимого конфигурационного файла"""
    content = config_manager.get_config_content(name)
    if content is None:
        raise HTTPException(status_code=404, detail="Файл конфигурации не найден")
    return {"content": content}

@router.put("/configs/{name}/content")
async def update_config_content(name: str, content: ConfigContent):
    """Обновление содержимого конфигурационного файла"""
    if not config_manager.validate_config(content.content):
        raise HTTPException(status_code=400, detail="Некорректный формат JSON")
    if not config_manager.save_config_content(name, content.content):
        raise HTTPException(status_code=404, detail="Файл конфигурации не найден")
    return {"message": "Содержимое файла обновлено"}

@router.get("/settings", response_model=Settings)
async def get_settings():
    """Получение настроек приложения"""
    return config_manager.get_settings()

@router.put("/settings")
async def update_settings(settings: Settings):
    """Обновление настроек приложения"""
    config_manager.update_settings(settings.dict())
    return {"message": "Настройки обновлены"}

@router.get("/api-keys", response_model=ApiKeys)
async def get_api_keys():
    """Получение API ключей"""
    return config_manager.get_api_keys()

@router.put("/api-keys")
async def update_api_keys(api_keys: ApiKeys):
    """Обновление API ключей"""
    config_manager.update_api_keys(api_keys.dict(exclude_none=True))
    return {"message": "API ключи обновлены"} 