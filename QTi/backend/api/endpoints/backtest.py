from typing import List
from fastapi import APIRouter, HTTPException
from ...schemas.backtest import BacktestConfig, BacktestResult, BacktestHistory
from ...services.backtest import backtest_service

router = APIRouter()

@router.post("/run", response_model=BacktestResult)
async def run_backtest(config: BacktestConfig):
    try:
        return backtest_service.run_backtest(config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results", response_model=List[BacktestResult])
async def get_backtest_results():
    try:
        return backtest_service.get_backtest_results()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{result_id}", response_model=BacktestResult)
async def get_backtest_result(result_id: str):
    try:
        return backtest_service.get_backtest_result(result_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/results/{result_id}")
async def delete_backtest_result(result_id: str):
    try:
        backtest_service.delete_backtest_result(result_id)
        return {"message": "Backtest result deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[BacktestHistory])
async def get_backtest_history():
    try:
        return backtest_service.get_backtest_history()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 