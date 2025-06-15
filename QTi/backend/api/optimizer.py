from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from ..core.optimizer import Optimizer
from ..core.config_manager import ConfigManager
from ..core.backtest import BacktestManager

router = APIRouter()
config_manager = ConfigManager()
backtest_manager = BacktestManager(config_manager)
optimizer = Optimizer(config_manager, backtest_manager)

class OptimizationParams(BaseModel):
    name: str
    config_path: str
    param_ranges: Dict[str, List[Any]]
    start_date: str
    end_date: str
    exchange: str
    symbol: str
    optimization_type: str = "full"

class OptimizationResult(BaseModel):
    name: str
    start_time: str
    end_time: Optional[str]
    status: str
    progress: float
    total_combinations: int
    current_combination: int
    results: List[Dict[str, Any]]
    best_result: Optional[Dict[str, Any]]
    param_ranges: Dict[str, List[Any]]
    config_path: str
    exchange: str
    symbol: str
    start_date: str
    end_date: str
    optimization_type: str

@router.post("/optimize", response_model=OptimizationResult)
async def start_optimization(params: OptimizationParams):
    """Запуск оптимизации"""
    try:
        result = await optimizer.start_optimization(
            params.name,
            params.config_path,
            params.param_ranges,
            params.start_date,
            params.end_date,
            params.exchange,
            params.symbol,
            params.optimization_type,
        )
        return result.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimize/{name}", response_model=OptimizationResult)
async def get_optimization(name: str):
    """Получение информации об оптимизации"""
    result = optimizer.get_optimization(name)
    if not result:
        raise HTTPException(status_code=404, detail="Оптимизация не найдена")
    return result.to_dict()

@router.get("/optimize", response_model=List[OptimizationResult])
async def list_optimizations():
    """Получение списка всех оптимизаций"""
    return optimizer.list_optimizations()

@router.post("/optimize/{name}/stop")
async def stop_optimization(name: str):
    """Остановка оптимизации"""
    if not optimizer.stop_optimization(name):
        raise HTTPException(status_code=404, detail="Оптимизация не найдена или уже остановлена")
    return {"message": "Оптимизация остановлена"} 