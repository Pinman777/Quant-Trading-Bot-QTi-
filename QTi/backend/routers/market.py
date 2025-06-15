from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db
from ..config import settings
import aiohttp
import asyncio
from datetime import datetime, timedelta
import json
from pathlib import Path

from ..models import User
from ..schemas.market import (
    MarketData,
    GlobalMetrics,
    Cryptocurrency,
    CryptocurrencyDetails,
    Timeframe
)
from ..dependencies import get_current_user
from ..services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["market"])
market_service = MarketService()

# Cache settings
CACHE_DIR = Path("./data/cache")
CACHE_EXPIRY = timedelta(minutes=5)

# Ensure cache directory exists
CACHE_DIR.mkdir(parents=True, exist_ok=True)

async def get_cached_data(cache_key: str) -> Dict:
    """Get data from cache if it exists and is not expired"""
    cache_file = CACHE_DIR / f"{cache_key}.json"
    if not cache_file.exists():
        return None
    
    try:
        with open(cache_file, "r") as f:
            data = json.load(f)
            if datetime.fromisoformat(data["timestamp"]) + CACHE_EXPIRY > datetime.now():
                return data["data"]
    except Exception:
        pass
    return None

async def save_to_cache(cache_key: str, data: Dict) -> None:
    """Save data to cache with timestamp"""
    cache_file = CACHE_DIR / f"{cache_key}.json"
    try:
        with open(cache_file, "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "data": data
            }, f)
    except Exception as e:
        print(f"Error saving to cache: {str(e)}")

async def fetch_from_cmc(endpoint: str, params: Dict = None) -> Dict:
    """Fetch data from CoinMarketCap API"""
    headers = {
        "X-CMC_PRO_API_KEY": settings.COINMARKETCAP_API_KEY,
        "Accept": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://pro-api.coinmarketcap.com/v1/{endpoint}",
            headers=headers,
            params=params
        ) as response:
            if response.status != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"CoinMarketCap API error: {await response.text()}"
                )
            return await response.json()

@router.get("/listings")
async def get_listings(
    limit: int = 100,
    current_user: schemas.User = Depends(security.get_current_active_user)
) -> Any:
    """Get cryptocurrency listings from CoinMarketCap"""
    cache_key = f"listings_{limit}"
    
    # Try to get from cache
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from API
    data = await fetch_from_cmc("cryptocurrency/listings/latest", {
        "limit": limit,
        "convert": "USD"
    })
    
    # Save to cache
    await save_to_cache(cache_key, data)
    return data

@router.get("/quotes/{symbol}")
async def get_quotes(
    symbol: str,
    current_user: schemas.User = Depends(security.get_current_active_user)
) -> Any:
    """Get cryptocurrency quotes from CoinMarketCap"""
    cache_key = f"quotes_{symbol}"
    
    # Try to get from cache
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from API
    data = await fetch_from_cmc("cryptocurrency/quotes/latest", {
        "symbol": symbol,
        "convert": "USD"
    })
    
    # Save to cache
    await save_to_cache(cache_key, data)
    return data

@router.get("/ohlcv/{symbol}")
async def get_ohlcv(
    symbol: str,
    time_start: datetime,
    time_end: datetime,
    interval: str = "1h",
    current_user: schemas.User = Depends(security.get_current_active_user)
) -> Any:
    """Get OHLCV data from CoinMarketCap"""
    cache_key = f"ohlcv_{symbol}_{interval}_{time_start.isoformat()}_{time_end.isoformat()}"
    
    # Try to get from cache
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from API
    data = await fetch_from_cmc("cryptocurrency/ohlcv/historical", {
        "symbol": symbol,
        "time_start": time_start.isoformat(),
        "time_end": time_end.isoformat(),
        "interval": interval,
        "convert": "USD"
    })
    
    # Save to cache
    await save_to_cache(cache_key, data)
    return data

@router.get("/global", response_model=GlobalMetrics)
async def get_global_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        metrics = await market_service.get_global_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending(
    current_user: schemas.User = Depends(security.get_current_active_user)
) -> Any:
    """Get trending cryptocurrencies from CoinMarketCap"""
    cache_key = "trending"
    
    # Try to get from cache
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from API
    data = await fetch_from_cmc("cryptocurrency/trending/gainers-losers")
    
    # Save to cache
    await save_to_cache(cache_key, data)
    return data

@router.get("/search")
async def search_cryptocurrencies(
    query: str,
    current_user: schemas.User = Depends(security.get_current_active_user)
) -> Any:
    """Search cryptocurrencies on CoinMarketCap"""
    cache_key = f"search_{query}"
    
    # Try to get from cache
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return cached_data
    
    # Fetch from API
    data = await fetch_from_cmc("cryptocurrency/map", {
        "symbol": query
    })
    
    # Save to cache
    await save_to_cache(cache_key, data)
    return data

@router.get("/cryptocurrencies", response_model=List[Cryptocurrency])
async def get_cryptocurrencies(
    limit: int = 100,
    start: int = 1,
    convert: str = "USD",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        cryptocurrencies = await market_service.get_cryptocurrencies(
            limit=limit,
            start=start,
            convert=convert
        )
        return cryptocurrencies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cryptocurrencies/{symbol}", response_model=CryptocurrencyDetails)
async def get_cryptocurrency_details(
    symbol: str,
    convert: str = "USD",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        details = await market_service.get_cryptocurrency_details(
            symbol=symbol,
            convert=convert
        )
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cryptocurrencies/{symbol}/quotes")
async def get_cryptocurrency_quotes(
    symbol: str,
    timeframe: Timeframe,
    limit: int = 100,
    convert: str = "USD",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        quotes = await market_service.get_cryptocurrency_quotes(
            symbol=symbol,
            timeframe=timeframe,
            limit=limit,
            convert=convert
        )
        return quotes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=List[Cryptocurrency])
async def search_cryptocurrencies(
    query: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        results = await market_service.search_cryptocurrencies(
            query=query,
            limit=limit
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/favorites")
async def get_favorite_cryptocurrencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        favorites = await market_service.get_favorite_cryptocurrencies(current_user.id)
        return favorites
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/favorites/{symbol}")
async def add_favorite_cryptocurrency(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        await market_service.add_favorite_cryptocurrency(current_user.id, symbol)
        return {"message": "Cryptocurrency added to favorites"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/favorites/{symbol}")
async def remove_favorite_cryptocurrency(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        await market_service.remove_favorite_cryptocurrency(current_user.id, symbol)
        return {"message": "Cryptocurrency removed from favorites"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 