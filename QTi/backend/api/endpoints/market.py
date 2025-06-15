from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ...services.market_data import market_data_service
from ...core.auth import get_current_user
from ...schemas.market import (
    MarketData,
    HistoricalData,
    GlobalMetrics,
    SymbolData,
    Timeframe
)
from ...services.market import MarketService

router = APIRouter()
market_service = MarketService()

@router.get("/symbols", response_model=List[MarketData])
async def get_market_data(
    limit: int = Query(100, ge=1, le=500),
    current_user = Depends(get_current_user)
):
    """
    Получает рыночные данные для топ криптовалют
    """
    try:
        return await market_data_service.get_market_data(limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching market data: {str(e)}"
        )

@router.get("/historical/{symbol}", response_model=List[HistoricalData])
async def get_historical_data(
    symbol: str,
    interval: str = Query("1d", regex="^(1m|5m|15m|30m|1h|4h|1d|1w)$"),
    limit: int = Query(100, ge=1, le=1000),
    current_user = Depends(get_current_user)
):
    """
    Получает исторические данные для криптовалюты
    """
    try:
        return await market_data_service.get_historical_data(
            symbol=symbol,
            interval=interval,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching historical data: {str(e)}"
        )

@router.get("/global", response_model=GlobalMetrics)
async def get_global_metrics(
    current_user = Depends(get_current_user)
):
    """
    Получает глобальные метрики криптовалютного рынка
    """
    try:
        return await market_data_service.get_global_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching global metrics: {str(e)}"
        )

@router.get("/market", response_model=List[MarketData])
async def get_market_data():
    """Get market data for all symbols"""
    try:
        return market_service.get_market_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market/{symbol}", response_model=SymbolData)
async def get_symbol_data(symbol: str, timeframe: str = "1h"):
    """Get market data for a specific symbol"""
    try:
        return market_service.get_symbol_data(symbol, timeframe)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/symbols", response_model=List[str])
async def get_symbols():
    """Get list of available trading symbols"""
    try:
        return market_service.get_symbols()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/timeframes", response_model=List[Timeframe])
async def get_timeframes():
    """Get list of available timeframes"""
    try:
        return market_service.get_timeframes()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 