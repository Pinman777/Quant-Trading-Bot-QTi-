import asyncio
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
import logging
from ..models import User
from ..schemas.market import (
    MarketData,
    GlobalMetrics,
    Cryptocurrency,
    CryptocurrencyDetails,
    Timeframe
)
from ratelimit import limits, sleep_and_retry
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class MarketService:
    def __init__(self):
        self.api_key = os.getenv("COINMARKETCAP_API_KEY")
        self.base_url = "https://pro-api.coinmarketcap.com/v1"
        self.cache_dir = os.path.join(os.path.dirname(__file__), "../../cache")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.cache_duration = {
            "global": timedelta(minutes=5),
            "cryptocurrencies": timedelta(minutes=5),
            "details": timedelta(minutes=5),
            "quotes": timedelta(minutes=1)
        }
        self.session = None
        self.rate_limit = 30  # запросов в минуту
        self.retry_attempts = 3

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    @sleep_and_retry
    @limits(calls=30, period=60)
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Выполнение запроса к CoinMarketCap API с rate limiting и retry"""
        if not self.api_key:
            raise ValueError("CoinMarketCap API key is not set")
            
        headers = {
            "X-CMC_PRO_API_KEY": self.api_key,
            "Accept": "application/json"
        }
        
        try:
            async with self.session.get(
                f"{self.base_url}/{endpoint}",
                headers=headers,
                params=params
            ) as response:
                if response.status == 429:  # Too Many Requests
                    retry_after = int(response.headers.get("Retry-After", 60))
                    await asyncio.sleep(retry_after)
                    raise Exception("Rate limit exceeded")
                    
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"CoinMarketCap API error: {error_text}")
                    raise Exception(f"CoinMarketCap API error: {response.status}")
                    
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"Network error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error making request to CoinMarketCap: {str(e)}")
            raise

    def _get_cache_path(self, cache_type: str, identifier: str) -> str:
        """Get cache file path"""
        return os.path.join(self.cache_dir, f"{cache_type}_{identifier}.json")

    def _is_cache_valid(self, cache_path: str, cache_type: str) -> bool:
        """Check if cache is valid"""
        if not os.path.exists(cache_path):
            return False
        
        file_time = datetime.fromtimestamp(os.path.getmtime(cache_path))
        return datetime.now() - file_time < self.cache_duration[cache_type]

    async def _get_cached_data(self, cache_type: str, identifier: str) -> Optional[Dict[str, Any]]:
        """Get data from cache"""
        cache_path = self._get_cache_path(cache_type, identifier)
        if self._is_cache_valid(cache_path, cache_type):
            with open(cache_path, "r") as f:
                return json.load(f)
        return None

    async def _save_to_cache(self, cache_type: str, identifier: str, data: Dict[str, Any]):
        """Save data to cache"""
        cache_path = self._get_cache_path(cache_type, identifier)
        with open(cache_path, "w") as f:
            json.dump(data, f)

    async def get_global_metrics(self) -> GlobalMetrics:
        """Get global cryptocurrency market metrics"""
        # Try to get from cache
        cached_data = await self._get_cached_data("global", "metrics")
        if cached_data:
            return GlobalMetrics(**cached_data)

        # Get from API
        data = await self._make_request("global-metrics/quotes/latest")
        metrics = data["data"]
        
        # Save to cache
        await self._save_to_cache("global", "metrics", metrics)
        
        return GlobalMetrics(**metrics)

    async def get_cryptocurrencies(
        self,
        limit: int = 100,
        start: int = 1,
        convert: str = "USD"
    ) -> List[Cryptocurrency]:
        """Get list of cryptocurrencies"""
        # Try to get from cache
        cache_id = f"list_{limit}_{start}_{convert}"
        cached_data = await self._get_cached_data("cryptocurrencies", cache_id)
        if cached_data:
            return [Cryptocurrency(**item) for item in cached_data]

        # Get from API
        params = {
            "limit": limit,
            "start": start,
            "convert": convert
        }
        data = await self._make_request("cryptocurrency/listings/latest", params)
        cryptocurrencies = data["data"]
        
        # Save to cache
        await self._save_to_cache("cryptocurrencies", cache_id, cryptocurrencies)
        
        return [Cryptocurrency(**item) for item in cryptocurrencies]

    async def get_cryptocurrency_details(
        self,
        symbol: str,
        convert: str = "USD"
    ) -> CryptocurrencyDetails:
        """Get detailed information about a cryptocurrency"""
        # Try to get from cache
        cache_id = f"{symbol}_{convert}"
        cached_data = await self._get_cached_data("details", cache_id)
        if cached_data:
            return CryptocurrencyDetails(**cached_data)

        # Get from API
        params = {
            "symbol": symbol,
            "convert": convert
        }
        data = await self._make_request("cryptocurrency/quotes/latest", params)
        details = data["data"][symbol]
        
        # Save to cache
        await self._save_to_cache("details", cache_id, details)
        
        return CryptocurrencyDetails(**details)

    async def get_cryptocurrency_quotes(
        self,
        symbol: str,
        timeframe: Timeframe,
        limit: int = 100,
        convert: str = "USD"
    ) -> List[Dict[str, Any]]:
        """Get historical quotes for a cryptocurrency"""
        # Try to get from cache
        cache_id = f"{symbol}_{timeframe}_{limit}_{convert}"
        cached_data = await self._get_cached_data("quotes", cache_id)
        if cached_data:
            return cached_data

        # Get from API
        params = {
            "symbol": symbol,
            "convert": convert,
            "count": limit,
            "interval": timeframe
        }
        data = await self._make_request("cryptocurrency/quotes/historical", params)
        quotes = data["data"][symbol]["quotes"]
        
        # Save to cache
        await self._save_to_cache("quotes", cache_id, quotes)
        
        return quotes

    async def search_cryptocurrencies(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for cryptocurrencies"""
        params = {
            "q": query,
            "limit": limit
        }
        data = await self._make_request("cryptocurrency/map", params)
        return data["data"]

    async def get_favorite_cryptocurrencies(self, user_id: int) -> List[Cryptocurrency]:
        """Get user's favorite cryptocurrencies"""
        # TODO: Implement database storage for favorites
        return []

    async def add_favorite_cryptocurrency(self, user_id: int, symbol: str):
        """Add cryptocurrency to user's favorites"""
        # TODO: Implement database storage for favorites
        pass

    async def remove_favorite_cryptocurrency(self, user_id: int, symbol: str):
        """Remove cryptocurrency from user's favorites"""
        # TODO: Implement database storage for favorites
        pass 