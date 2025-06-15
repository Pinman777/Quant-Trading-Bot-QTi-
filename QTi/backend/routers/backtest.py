from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db
from ..core.backtest import BacktestManager
from ..config import settings
import json
from pathlib import Path
import logging
from datetime import datetime
import asyncio
import pandas as pd
import numpy as np
from ..models import Backtest, User
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/backtest",
    tags=["backtest"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

# Инициализация менеджера бэктестинга
backtest_manager = BacktestManager(settings.BOT_PATH)

@router.get("/", response_model=List[schemas.BacktestResult])
async def get_backtests(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить список всех бэктестов пользователя"""
    backtests = db.query(models.Backtest).filter(
        models.Backtest.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return backtests

@router.post("/", response_model=schemas.BacktestResult)
async def create_backtest(
    backtest: schemas.BacktestCreate,
    background_tasks: BackgroundTasks,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать и запустить новый бэктест"""
    # Проверяем существование бота
    db_bot = db.query(models.Bot).filter(
        models.Bot.id == backtest.bot_id,
        models.Bot.user_id == current_user.id
    ).first()
    
    if not db_bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бот не найден"
        )
    
    # Создаем запись в базе данных
    db_backtest = models.Backtest(
        user_id=current_user.id,
        bot_id=backtest.bot_id,
        name=backtest.name,
        start_date=backtest.start_date,
        end_date=backtest.end_date,
        status="pending",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    db.add(db_backtest)
    db.commit()
    db.refresh(db_backtest)
    
    # Запускаем бэктест в фоновом режиме
    background_tasks.add_task(
        run_backtest,
        db_backtest.id,
        db_bot.config_path,
        backtest.start_date,
        backtest.end_date,
        db
    )
    
    return db_backtest

@router.get("/{backtest_id}", response_model=schemas.BacktestResult)
async def get_backtest(
    backtest_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить информацию о конкретном бэктесте"""
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бэктест не найден"
        )
    
    return backtest

@router.delete("/{backtest_id}")
async def delete_backtest(
    backtest_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить бэктест"""
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бэктест не найден"
        )
    
    # Удаляем результаты бэктеста
    results_dir = Path(settings.BACKTEST_RESULTS_DIR) / str(backtest_id)
    if results_dir.exists():
        for file in results_dir.glob("*"):
            file.unlink()
        results_dir.rmdir()
    
    # Удаляем запись из базы данных
    db.delete(backtest)
    db.commit()
    
    return {"message": "Бэктест успешно удален"}

@router.get("/{backtest_id}/results")
async def get_backtest_results(
    backtest_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить результаты бэктеста"""
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бэктест не найден"
        )
    
    if backtest.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бэктест еще не завершен"
        )
    
    # Загружаем результаты из файла
    results_file = Path(settings.BACKTEST_RESULTS_DIR) / str(backtest_id) / "results.json"
    if not results_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Результаты бэктеста не найдены"
        )
    
    with open(results_file, "r") as f:
        results = json.load(f)
    
    return results

@router.get("/{backtest_id}/trades")
async def get_backtest_trades(
    backtest_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить список сделок бэктеста"""
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бэктест не найден"
        )
    
    if backtest.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бэктест еще не завершен"
        )
    
    # Загружаем сделки из файла
    trades_file = Path(settings.BACKTEST_RESULTS_DIR) / str(backtest_id) / "trades.csv"
    if not trades_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Сделки бэктеста не найдены"
        )
    
    trades_df = pd.read_csv(trades_file)
    trades_df = trades_df.iloc[skip:skip + limit]
    
    return trades_df.to_dict(orient="records")

@router.get("/{backtest_id}/equity")
async def get_backtest_equity(
    backtest_id: int,
    current_user: schemas.User = Depends(security.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить график эквити бэктеста"""
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Бэктест не найден"
        )
    
    if backtest.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бэктест еще не завершен"
        )
    
    # Загружаем данные эквити из файла
    equity_file = Path(settings.BACKTEST_RESULTS_DIR) / str(backtest_id) / "equity.csv"
    if not equity_file.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Данные эквити не найдены"
        )
    
    equity_df = pd.read_csv(equity_file)
    
    return equity_df.to_dict(orient="records")

async def run_backtest(
    backtest_id: int,
    config_path: str,
    start_date: datetime,
    end_date: datetime,
    db: Session
):
    """Запустить бэктест в фоновом режиме"""
    try:
        # Обновляем статус
        backtest = db.query(models.Backtest).filter(
            models.Backtest.id == backtest_id
        ).first()
        backtest.status = "running"
        db.commit()
        
        # Создаем директорию для результатов
        results_dir = Path(settings.BACKTEST_RESULTS_DIR) / str(backtest_id)
        results_dir.mkdir(parents=True, exist_ok=True)
        
        # Запускаем бэктест
        results = await backtest_manager.run_backtest(
            config_path=config_path,
            start_date=start_date,
            end_date=end_date,
            results_dir=str(results_dir)
        )
        
        # Сохраняем результаты
        with open(results_dir / "results.json", "w") as f:
            json.dump(results, f, indent=2)
        
        # Обновляем статус
        backtest.status = "completed"
        backtest.results = results
        backtest.updated_at = datetime.now()
        db.commit()
        
    except Exception as e:
        logger.error(f"Ошибка при выполнении бэктеста {backtest_id}: {str(e)}")
        backtest.status = "error"
        backtest.error_message = str(e)
        backtest.updated_at = datetime.now()
        db.commit()

@router.post("/backtests/", response_model=schemas.BacktestResponse)
async def create_backtest_new(
    backtest: schemas.BacktestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    db_backtest = models.Backtest(
        name=backtest.name,
        config=backtest.config,
        results={},
        owner_id=current_user.id
    )
    db.add(db_backtest)
    db.commit()
    db.refresh(db_backtest)
    return db_backtest

@router.get("/backtests/", response_model=List[schemas.BacktestResponse])
async def get_backtests_new(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return db.query(models.Backtest).filter(models.Backtest.owner_id == current_user.id).all()

@router.get("/backtests/{backtest_id}", response_model=schemas.BacktestResponse)
async def get_backtest_new(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.owner_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    return backtest

@router.delete("/backtests/{backtest_id}")
async def delete_backtest_new(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.owner_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    
    db.delete(backtest)
    db.commit()
    return {"message": "Backtest deleted successfully"}

@router.post("/backtests/{backtest_id}/run")
async def run_backtest_new(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.owner_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    
    try:
        results = await backtest_manager.run_backtest(backtest)
        backtest.results = results
        db.commit()
        return {"message": "Backtest completed successfully", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backtests/{backtest_id}/results")
async def get_backtest_results_new(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    backtest = db.query(models.Backtest).filter(
        models.Backtest.id == backtest_id,
        models.Backtest.owner_id == current_user.id
    ).first()
    if not backtest:
        raise HTTPException(status_code=404, detail="Backtest not found")
    
    if not backtest.results:
        raise HTTPException(status_code=400, detail="Backtest has not been run yet")
    
    return backtest.results 