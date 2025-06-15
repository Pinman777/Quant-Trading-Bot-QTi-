from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class Timeframe(str, Enum):
    MINUTE = "1m"
    HOUR = "1h"
    DAY = "1d"
    WEEK = "1w"
    MONTH = "1m"
    YEAR = "1y"

class MarketData(BaseModel):
    price: float
    volume_24h: float
    percent_change_1h: float
    percent_change_24h: float
    percent_change_7d: float
    market_cap: float
    last_updated: datetime

class GlobalMetrics(BaseModel):
    total_market_cap: float
    total_volume_24h: float
    btc_dominance: float
    eth_dominance: float
    active_cryptocurrencies: int
    active_exchanges: int
    last_updated: datetime

class Cryptocurrency(BaseModel):
    id: int
    name: str
    symbol: str
    slug: str
    cmc_rank: int
    market_cap: float
    price: float
    volume_24h: float
    percent_change_1h: float
    percent_change_24h: float
    percent_change_7d: float
    last_updated: datetime

class CryptocurrencyDetails(Cryptocurrency):
    circulating_supply: float
    total_supply: float
    max_supply: Optional[float]
    tags: List[str]
    platform: Optional[Dict[str, Any]]
    quote: Dict[str, MarketData]

class Quote(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

class SearchResult(BaseModel):
    id: int
    name: str
    symbol: str
    slug: str
    rank: Optional[int]
    is_active: bool
    first_historical_data: Optional[datetime]
    last_historical_data: Optional[datetime]
    platform: Optional[Dict[str, Any]] 