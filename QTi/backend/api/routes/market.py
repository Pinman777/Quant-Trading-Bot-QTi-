from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ...core.market_data import MarketData
from ...dependencies import get_market_data

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/overview", response_model=List[Dict[str, Any]])
async def get_market_overview(market_data: MarketData = Depends(get_market_data)):
    """Получить обзор рынка"""
    try:
        return await market_data.get_market_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ticker/{symbol}", response_model=Dict[str, Any])
async def get_ticker(
    symbol: str,
    market_data: MarketData = Depends(get_market_data)
):
    """Получить данные по конкретной монете"""
    try:
        data = await market_data.get_ticker(symbol)
        if not data:
            raise HTTPException(status_code=404, detail=f"Ticker {symbol} not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/historical/{symbol}", response_model=List[Dict[str, Any]])
async def get_historical_data(
    symbol: str,
    days: int = 30,
    market_data: MarketData = Depends(get_market_data)
):
    """Получить исторические данные по монете"""
    try:
        data = await market_data.get_historical_data(symbol, days)
        if not data:
            raise HTTPException(status_code=404, detail=f"Historical data for {symbol} not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 