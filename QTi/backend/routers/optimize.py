from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..core.optimizer import Optimizer
from ..core.strategy import Strategy
from ..schemas.optimize import (
    OptimizationCreate,
    OptimizationResponse,
    OptimizationResult,
    OptimizationStatus
)
from ..crud import crud
from ..security import get_current_user
import logging
import json
from datetime import datetime
import asyncio
from pathlib import Path
from ..models import Optimization, User
from ..dependencies import get_current_user
from ..services.optimize_manager import OptimizeManager

router = APIRouter(
    prefix="/optimize",
    tags=["optimize"]
)

logger = logging.getLogger(__name__)
optimize_manager = OptimizeManager()

@router.get("/{bot_id}", response_model=List[OptimizationResponse])
async def get_optimizations(
    bot_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Получить список оптимизаций для бота
    """
    # Проверяем права доступа
    if not await crud.check_bot_ownership(db, bot_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    optimizations = await crud.get_optimizations(
        db,
        bot_id=bot_id,
        skip=skip,
        limit=limit
    )
    
    return optimizations

@router.post("/{bot_id}", response_model=OptimizationResponse)
async def create_optimization(
    bot_id: int,
    optimization: OptimizationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Создать новую оптимизацию для бота
    """
    # Проверяем права доступа
    if not await crud.check_bot_ownership(db, bot_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    # Проверяем существование бота
    bot = await crud.get_bot(db, bot_id)
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bot not found"
        )
        
    # Создаем оптимизацию
    db_optimization = await crud.create_optimization(
        db,
        bot_id=bot_id,
        optimization=optimization
    )
    
    # Запускаем оптимизацию в фоне
    background_tasks.add_task(
        run_optimization,
        db,
        db_optimization.id,
        bot.config_path,
        optimization.param_ranges,
        optimization.start_date,
        optimization.end_date,
        optimization.exchange,
        optimization.symbol,
        optimization.optimization_type
    )
    
    return db_optimization

@router.get("/{bot_id}/{optimization_id}", response_model=OptimizationResponse)
async def get_optimization(
    bot_id: int,
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Получить информацию об оптимизации
    """
    # Проверяем права доступа
    if not await crud.check_bot_ownership(db, bot_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    optimization = await crud.get_optimization(db, optimization_id)
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization not found"
        )
        
    return optimization

@router.delete("/{bot_id}/{optimization_id}", response_model=OptimizationResponse)
async def delete_optimization(
    bot_id: int,
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Удалить оптимизацию
    """
    # Проверяем права доступа
    if not await crud.check_bot_ownership(db, bot_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    optimization = await crud.get_optimization(db, optimization_id)
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization not found"
        )
        
    # Удаляем результаты оптимизации
    results_path = Path(f"data/optimizations/{optimization_id}")
    if results_path.exists():
        for file in results_path.glob("*"):
            file.unlink()
        results_path.rmdir()
        
    return await crud.delete_optimization(db, optimization_id)

async def run_optimization(
    db: Session,
    optimization_id: int,
    config_path: str,
    param_ranges: Dict[str, List[Any]],
    start_date: datetime,
    end_date: datetime,
    exchange: str,
    symbol: str,
    optimization_type: str
):
    """
    Запускает оптимизацию в фоновом режиме
    """
    try:
        # Обновляем статус
        await crud.update_optimization_status(
            db,
            optimization_id,
            OptimizationStatus.RUNNING
        )
        
        # Создаем оптимизатор
        optimizer = Optimizer(
            config_path=config_path,
            param_ranges=param_ranges,
            start_date=start_date,
            end_date=end_date,
            exchange=exchange,
            symbol=symbol,
            optimization_type=optimization_type
        )
        
        # Запускаем оптимизацию
        results = await optimizer.optimize()
        
        # Сохраняем результаты
        results_path = Path(f"data/optimizations/{optimization_id}")
        results_path.mkdir(parents=True, exist_ok=True)
        
        # Сохраняем лучшие параметры
        with open(results_path / "best_params.json", "w") as f:
            json.dump(results.best_params, f)
            
        # Сохраняем историю оптимизации
        with open(results_path / "history.json", "w") as f:
            json.dump(results.history, f)
            
        # Сохраняем статистику
        with open(results_path / "stats.json", "w") as f:
            json.dump(results.stats, f)
            
        # Обновляем статус
        await crud.update_optimization_status(
            db,
            optimization_id,
            OptimizationStatus.COMPLETED
        )
        
    except Exception as e:
        logger.error(f"Error during optimization: {str(e)}")
        await crud.update_optimization_status(
            db,
            optimization_id,
            OptimizationStatus.FAILED
        )
        raise 

@router.post("/optimizations/", response_model=OptimizationResponse)
async def create_optimization(
    optimization: OptimizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_optimization = Optimization(
        name=optimization.name,
        config=optimization.config,
        results={},
        owner_id=current_user.id
    )
    db.add(db_optimization)
    db.commit()
    db.refresh(db_optimization)
    return db_optimization

@router.get("/optimizations/", response_model=List[OptimizationResponse])
async def get_optimizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Optimization).filter(Optimization.owner_id == current_user.id).all()

@router.get("/optimizations/{optimization_id}", response_model=OptimizationResponse)
async def get_optimization(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    optimization = db.query(Optimization).filter(
        Optimization.id == optimization_id,
        Optimization.owner_id == current_user.id
    ).first()
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    return optimization

@router.delete("/optimizations/{optimization_id}")
async def delete_optimization(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    optimization = db.query(Optimization).filter(
        Optimization.id == optimization_id,
        Optimization.owner_id == current_user.id
    ).first()
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    
    db.delete(optimization)
    db.commit()
    return {"message": "Optimization deleted successfully"}

@router.post("/optimizations/{optimization_id}/run")
async def run_optimization(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    optimization = db.query(Optimization).filter(
        Optimization.id == optimization_id,
        Optimization.owner_id == current_user.id
    ).first()
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    
    try:
        results = await optimize_manager.run_optimization(optimization)
        optimization.results = results
        db.commit()
        return {"message": "Optimization completed successfully", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimizations/{optimization_id}/results")
async def get_optimization_results(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    optimization = db.query(Optimization).filter(
        Optimization.id == optimization_id,
        Optimization.owner_id == current_user.id
    ).first()
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    
    if not optimization.results:
        raise HTTPException(status_code=400, detail="Optimization has not been run yet")
    
    return optimization.results

@router.post("/optimizations/{optimization_id}/cancel")
async def cancel_optimization(
    optimization_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    optimization = db.query(Optimization).filter(
        Optimization.id == optimization_id,
        Optimization.owner_id == current_user.id
    ).first()
    if not optimization:
        raise HTTPException(status_code=404, detail="Optimization not found")
    
    try:
        await optimize_manager.cancel_optimization(optimization_id)
        return {"message": "Optimization cancelled successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 