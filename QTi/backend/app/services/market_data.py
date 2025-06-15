from typing import List, Dict, Any
import aiohttp
import asyncio
from datetime import datetime, timedelta

class MarketDataService:
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"
        self.session = None
        self._cache = {}
        self._cache_timeout = 60  # seconds

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    async def close(self):
        """Close aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()

    async def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
        start_time: int = None,
        end_time: int = None
    ) -> List[Dict[str, Any]]:
        """Get candlestick data from Binance."""
        cache_key = f"{symbol}_{timeframe}_{limit}_{start_time}_{end_time}"
        
        # Check cache
        if cache_key in self._cache:
            cache_time, cache_data = self._cache[cache_key]
            if (datetime.utcnow() - cache_time).total_seconds() < self._cache_timeout:
                return cache_data
        
        # Convert timeframe to Binance interval
        interval_map = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "30m": "30m",
            "1h": "1h",
            "4h": "4h",
            "1d": "1d",
        }
        interval = interval_map.get(timeframe, "1h")
        
        # Build request parameters
        params = {
            "symbol": symbol.upper(),
            "interval": interval,
            "limit": limit,
        }
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/klines", params=params) as response:
                if response.status != 200:
                    raise Exception(f"Failed to get candles: {response.status}")
                
                data = await response.json()
                
                # Format candles
                candles = [
                    {
                        "time": candle[0],
                        "open": float(candle[1]),
                        "high": float(candle[2]),
                        "low": float(candle[3]),
                        "close": float(candle[4]),
                        "volume": float(candle[5]),
                    }
                    for candle in data
                ]
                
                # Update cache
                self._cache[cache_key] = (datetime.utcnow(), candles)
                
                return candles
        except Exception as e:
            print(f"Error getting candles: {e}")
            return []

    async def get_volume(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500
    ) -> List[Dict[str, Any]]:
        """Get volume data for a symbol."""
        candles = await self.get_candles(symbol, timeframe, limit)
        return [
            {
                "time": candle["time"],
                "value": candle["volume"],
                "color": "green" if candle["close"] >= candle["open"] else "red",
            }
            for candle in candles
        ]

    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get current ticker data for a symbol."""
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/ticker/24hr", params={"symbol": symbol.upper()}) as response:
                if response.status != 200:
                    raise Exception(f"Failed to get ticker: {response.status}")
                
                data = await response.json()
                return {
                    "symbol": data["symbol"],
                    "price": float(data["lastPrice"]),
                    "price_change": float(data["priceChange"]),
                    "price_change_percent": float(data["priceChangePercent"]),
                    "volume": float(data["volume"]),
                    "quote_volume": float(data["quoteVolume"]),
                }
        except Exception as e:
            print(f"Error getting ticker: {e}")
            return {}

    async def get_order_book(self, symbol: str, limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
        """Get order book for a symbol."""
        try:
            session = await self._get_session()
            async with session.get(
                f"{self.base_url}/depth",
                params={"symbol": symbol.upper(), "limit": limit}
            ) as response:
                if response.status != 200:
                    raise Exception(f"Failed to get order book: {response.status}")
                
                data = await response.json()
                return {
                    "bids": [
                        {"price": float(price), "quantity": float(qty)}
                        for price, qty in data["bids"]
                    ],
                    "asks": [
                        {"price": float(price), "quantity": float(qty)}
                        for price, qty in data["asks"]
                    ],
                }
        except Exception as e:
            print(f"Error getting order book: {e}")
            return {"bids": [], "asks": []} 