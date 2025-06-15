import os
import aiohttp
import asyncio
from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
import json
from redis import Redis
from ..core.config import settings
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self):
        self.api_key = settings.CMC_API_KEY
        self.api_url = settings.CMC_API_URL
        self.cache_expire = settings.CMC_CACHE_EXPIRE
        self.redis = redis.from_url(settings.REDIS_URL) if settings.REDIS_URL else None
        self.cache_ttl = 300  # 5 минут

    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Выполняет запрос к CoinMarketCap API с кэшированием"""
        if not self.api_key:
            raise ValueError("CoinMarketCap API key is not set")

        # Проверяем кэш
        cache_key = f"cmc:{endpoint}:{json.dumps(params or {})}"
        cached_data = await self.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

        headers = {
            'X-CMC_PRO_API_KEY': self.api_key,
            'Accept': 'application/json'
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_url}/{endpoint}",
                    headers=headers,
                    params=params
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"CoinMarketCap API error: {error_text}")
                        raise Exception(f"CoinMarketCap API error: {response.status}")

                    data = await response.json()

                    # Кэшируем результат
                    await self.redis.setex(
                        cache_key,
                        self.cache_ttl,
                        json.dumps(data)
                    )

                    return data
        except Exception as e:
            logger.error(f"Error making request to CoinMarketCap: {str(e)}")
            raise

    def _get_cache_key(self, key: str) -> str:
        """Генерирует ключ для кэша"""
        return f"cmc:{key}"

    def _get_from_cache(self, key: str) -> Optional[Dict]:
        """Получает данные из кэша"""
        if not self.redis:
            return None

        cache_key = self._get_cache_key(key)
        data = self.redis.get(cache_key)
        if data:
            return json.loads(data)
        return None

    def _set_cache(self, key: str, data: Dict):
        """Сохраняет данные в кэш"""
        if not self.redis:
            return

        cache_key = self._get_cache_key(key)
        self.redis.setex(
            cache_key,
            self.cache_expire,
            json.dumps(data)
        )

    async def get_market_data(self, limit: int = 100) -> List[Dict]:
        """Получает рыночные данные для топ криптовалют"""
        cache_key = f"market_data:{limit}"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            response = await self._make_request(
                "cryptocurrency/listings/latest",
                {
                    'limit': limit,
                    'convert': 'USD'
                }
            )

            if 'data' not in response:
                raise ValueError("Invalid response from CoinMarketCap API")

            market_data = []
            for coin in response['data']:
                market_data.append({
                    'symbol': coin['symbol'],
                    'name': coin['name'],
                    'price': coin['quote']['USD']['price'],
                    'priceChange24h': coin['quote']['USD']['percent_change_24h'],
                    'volume24h': coin['quote']['USD']['volume_24h'],
                    'marketCap': coin['quote']['USD']['market_cap'],
                    'rank': coin['cmc_rank']
                })

            self._set_cache(cache_key, market_data)
            return market_data

        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            raise

    async def get_historical_data(
        self,
        symbol: str,
        interval: str,
        limit: int = 100
    ) -> List[Dict]:
        """Получает исторические данные для криптовалюты"""
        cache_key = f"historical_data:{symbol}:{interval}:{limit}"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            # Получаем ID криптовалюты
            response = await self._make_request(
                "cryptocurrency/quotes/latest",
                {
                    'symbol': symbol,
                    'convert': 'USD'
                }
            )

            if 'data' not in response:
                raise ValueError("Invalid response from CoinMarketCap API")

            coin_id = list(response['data'].keys())[0]

            # Получаем исторические данные
            historical_response = await self._make_request(
                "cryptocurrency/quotes/historical",
                {
                    'id': coin_id,
                    'interval': interval,
                    'count': limit,
                    'convert': 'USD'
                }
            )

            if 'data' not in historical_response:
                raise ValueError("Invalid response from CoinMarketCap API")

            historical_data = []
            for quote in historical_response['data']['quotes']:
                historical_data.append({
                    'timestamp': quote['timestamp'],
                    'open': quote['quote']['USD']['open'],
                    'high': quote['quote']['USD']['high'],
                    'low': quote['quote']['USD']['low'],
                    'close': quote['quote']['USD']['close'],
                    'volume': quote['quote']['USD']['volume']
                })

            self._set_cache(cache_key, historical_data)
            return historical_data

        except Exception as e:
            logger.error(f"Error fetching historical data: {str(e)}")
            raise

    async def get_global_metrics(self) -> Dict:
        """Получает глобальные метрики криптовалютного рынка"""
        cache_key = "global_metrics"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            response = await self._make_request("global-metrics/quotes/latest")

            if 'data' not in response:
                raise ValueError("Invalid response from CoinMarketCap API")

            metrics = response['data']['quote']['USD']
            global_data = {
                'total_market_cap': metrics['total_market_cap'],
                'total_volume_24h': metrics['total_volume_24h'],
                'btc_dominance': metrics['btc_dominance'],
                'eth_dominance': metrics['eth_dominance'],
                'active_cryptocurrencies': response['data']['active_cryptocurrencies'],
                'active_exchanges': response['data']['active_exchanges']
            }

            self._set_cache(cache_key, global_data)
            return global_data

        except Exception as e:
            logger.error(f"Error fetching global metrics: {str(e)}")
            raise

    async def clear_cache(self, pattern: str = "cmc:*") -> None:
        """Очистить кэш по паттерну"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

market_data_service = MarketDataService() 