from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from ..core.market_data import MarketData
from ..dependencies import get_market_data

router = APIRouter()

@router.get("/search")
async def search_symbols(
    query: str,
    market_data: MarketData = Depends(get_market_data)
) -> List[dict]:
    """
    Поиск криптовалют по символу или названию
    """
    try:
        results = await market_data.search_symbols(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overview")
async def get_market_overview(market_data: MarketData = Depends(get_market_data)):
    try:
        return await market_data.get_market_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ticker/{symbol}")
async def get_ticker(symbol: str, market_data: MarketData = Depends(get_market_data)):
    try:
        return await market_data.get_ticker(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    timeframe: str = Query("1d", description="Timeframe (1m, 5m, 15m, 1h, 4h, 1d)"),
    limit: int = Query(100, description="Number of candles to return"),
    market_data: MarketData = Depends(get_market_data)
):
    try:
        return await market_data.get_historical_data(symbol, timeframe, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicator/{symbol}")
async def get_indicator(
    symbol: str,
    indicator: str = Query(..., description="Technical indicator (RSI, MACD, SMA, EMA, Bollinger)"),
    period: int = Query(14, description="Period for the indicator"),
    timeframe: str = Query("1d", description="Timeframe (1m, 5m, 15m, 1h, 4h, 1d)"),
    market_data: MarketData = Depends(get_market_data)
):
    try:
        # Get historical data
        historical_data = await market_data.get_historical_data(symbol, timeframe, 200)  # Get more data for calculations
        
        # Convert to pandas DataFrame
        df = pd.DataFrame(historical_data)
        df['time'] = pd.to_datetime(df['time'])
        df.set_index('time', inplace=True)
        
        # Calculate indicator
        if indicator == "RSI":
            delta = df['close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            indicator_data = 100 - (100 / (1 + rs))
            
        elif indicator == "MACD":
            exp1 = df['close'].ewm(span=12, adjust=False).mean()
            exp2 = df['close'].ewm(span=26, adjust=False).mean()
            macd = exp1 - exp2
            signal = macd.ewm(span=9, adjust=False).mean()
            indicator_data = macd - signal
            
        elif indicator == "SMA":
            indicator_data = df['close'].rolling(window=period).mean()
            
        elif indicator == "EMA":
            indicator_data = df['close'].ewm(span=period, adjust=False).mean()
            
        elif indicator == "Bollinger":
            sma = df['close'].rolling(window=period).mean()
            std = df['close'].rolling(window=period).std()
            upper_band = sma + (std * 2)
            lower_band = sma - (std * 2)
            indicator_data = (upper_band + lower_band) / 2
            
        else:
            raise HTTPException(status_code=400, detail="Invalid indicator")
        
        # Prepare response
        result = []
        for time, value in indicator_data.items():
            if not np.isnan(value):  # Skip NaN values
                result.append({
                    "time": time.isoformat(),
                    "value": float(value)
                })
        
        return result[-100:]  # Return last 100 values
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 