import aiohttp
import asyncio
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import json
from pathlib import Path
import sqlite3

logger = logging.getLogger(__name__)

class MarketData:
    def __init__(self, api_key: str, cache_dir: str = "data/market"):
        self.api_key = api_key
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.cache_dir / "market_data.db"
        self._init_db()

    def _init_db(self) -> None:
        """Инициализирует SQLite базу данных для кэширования"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS market_data (
                    symbol TEXT PRIMARY KEY,
                    data JSON,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS historical_data (
                    symbol TEXT,
                    date TEXT,
                    data JSON,
                    PRIMARY KEY (symbol, date)
                )
            """)

    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Получает текущие данные по тикеру"""
        # Проверяем кэш
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT data, timestamp FROM market_data WHERE symbol = ?",
                (symbol,)
            )
            row = cursor.fetchone()
            if row:
                data, timestamp = row
                timestamp = datetime.fromisoformat(timestamp)
                if datetime.now() - timestamp < timedelta(minutes=5):
                    return json.loads(data)

        # Если нет в кэше или устарел, получаем новые данные
        async with aiohttp.ClientSession() as session:
            url = f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
            headers = {
                "X-CMC_PRO_API_KEY": self.api_key,
                "Accept": "application/json"
            }
            params = {
                "symbol": symbol,
                "convert": "USD"
            }
            
            try:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Сохраняем в кэш
                        with sqlite3.connect(self.db_path) as conn:
                            conn.execute(
                                "INSERT OR REPLACE INTO market_data (symbol, data, timestamp) VALUES (?, ?, ?)",
                                (symbol, json.dumps(data), datetime.now().isoformat())
                            )
                        return data
                    else:
                        logger.error(f"Ошибка при получении данных: {response.status}")
                        return {}
            except Exception as e:
                logger.error(f"Ошибка при запросе к CoinMarketCap: {e}")
                return {}

    async def get_historical_data(
        self,
        symbol: str,
        start_date: str,
        end_date: str
    ) -> List[Dict[str, Any]]:
        """Получает исторические данные"""
        # Проверяем кэш
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT data FROM historical_data WHERE symbol = ? AND date BETWEEN ? AND ?",
                (symbol, start_date, end_date)
            )
            rows = cursor.fetchall()
            if rows:
                return [json.loads(row[0]) for row in rows]

        # Если нет в кэше, получаем новые данные
        async with aiohttp.ClientSession() as session:
            url = f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical"
            headers = {
                "X-CMC_PRO_API_KEY": self.api_key,
                "Accept": "application/json"
            }
            params = {
                "symbol": symbol,
                "time_start": start_date,
                "time_end": end_date,
                "interval": "1d"
            }
            
            try:
                async with session.get(url, headers=headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Сохраняем в кэш
                        with sqlite3.connect(self.db_path) as conn:
                            for item in data["data"]:
                                conn.execute(
                                    "INSERT OR REPLACE INTO historical_data (symbol, date, data) VALUES (?, ?, ?)",
                                    (symbol, item["date"], json.dumps(item))
                                )
                        return data["data"]
                    else:
                        logger.error(f"Ошибка при получении исторических данных: {response.status}")
                        return []
            except Exception as e:
                logger.error(f"Ошибка при запросе исторических данных: {e}")
                return []

    async def get_market_overview(self) -> Dict[str, Any]:
        """Получает обзор рынка"""
        async with aiohttp.ClientSession() as session:
            url = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest"
            headers = {
                "X-CMC_PRO_API_KEY": self.api_key,
                "Accept": "application/json"
            }
            
            try:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        logger.error(f"Ошибка при получении обзора рынка: {response.status}")
                        return {}
            except Exception as e:
                logger.error(f"Ошибка при запросе обзора рынка: {e}")
                return {}

    def clear_cache(self, older_than: Optional[timedelta] = None) -> None:
        """Очищает кэш данных"""
        with sqlite3.connect(self.db_path) as conn:
            if older_than:
                cutoff = (datetime.now() - older_than).isoformat()
                conn.execute(
                    "DELETE FROM market_data WHERE timestamp < ?",
                    (cutoff,)
                )
            else:
                conn.execute("DELETE FROM market_data")
                conn.execute("DELETE FROM historical_data")

    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """
        Поиск криптовалют по символу или названию
        """
        cache_key = f"search_{query}"
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            return cached_data

        try:
            async with aiohttp.ClientSession() as session:
                # Получаем список всех криптовалют
                url = f"https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"
                params = {
                    "limit": 5000,
                    "convert": "USD"
                }
                async with session.get(url, headers={"X-CMC_PRO_API_KEY": self.api_key, "Accept": "application/json"}, params=params) as response:
                    if response.status != 200:
                        raise Exception(f"API request failed: {response.status}")
                    data = await response.json()
                    
                    # Фильтруем результаты по запросу
                    results = []
                    query = query.lower()
                    for coin in data["data"]:
                        if (query in coin["symbol"].lower() or 
                            query in coin["name"].lower()):
                            results.append({
                                "symbol": coin["symbol"],
                                "name": coin["name"],
                                "price": coin["quote"]["USD"]["price"],
                                "change24h": coin["quote"]["USD"]["percent_change_24h"]
                            })
                    
                    # Кэшируем результаты
                    self._cache_data(cache_key, results)
                    return results

        except Exception as e:
            logger.error(f"Error searching symbols: {str(e)}")
            raise

    def _get_cached_data(self, key: str) -> Optional[Any]:
        """Получение данных из кэша"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute(
            "SELECT data FROM market_data WHERE key = ? AND timestamp > ?",
            (key, (datetime.now() - timedelta(minutes=5)).isoformat())
        )
        result = c.fetchone()
        conn.close()
        return json.loads(result[0]) if result else None

    def _cache_data(self, key: str, data: Any):
        """Сохранение данных в кэш"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute(
            "INSERT OR REPLACE INTO market_data (key, data, timestamp) VALUES (?, ?, ?)",
            (key, json.dumps(data), datetime.now().isoformat())
        )
        conn.commit()
        conn.close()

    def _calculate_rsi(self, data: List[Dict[str, Any]], period: int = 14) -> List[Dict[str, Any]]:
        """Расчет RSI"""
        # Реализация расчета RSI
        pass

    def _calculate_macd(self, data: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Расчет MACD"""
        # Реализация расчета MACD
        pass

    def _calculate_bollinger_bands(self, data: List[Dict[str, Any]], period: int = 20) -> Dict[str, List[Dict[str, Any]]]:
        """Расчет линий Боллинджера"""
        # Реализация расчета линий Боллинджера
        pass

    def _calculate_stochastic(self, data: List[Dict[str, Any]], period: int = 14) -> Dict[str, List[Dict[str, Any]]]:
        """Расчет стохастического осциллятора"""
        # Реализация расчета стохастического осциллятора
        pass

    def _calculate_adx(self, data: List[Dict[str, Any]], period: int = 14) -> List[Dict[str, Any]]:
        """Расчет ADX"""
        # Реализация расчета ADX
        pass

    def _calculate_obv(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Расчет On-Balance Volume"""
        # Реализация расчета OBV
        pass

    def _calculate_ichimoku(self, data: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Расчет Ichimoku Cloud"""
        # Реализация расчета Ichimoku Cloud
        pass

    async def get_technical_indicators(
        self,
        symbol: str,
        timeframe: str = "1d",
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Получение технических индикаторов
        """
        cache_key = f"indicators_{symbol}_{timeframe}_{limit}"
        cached_data = self._get_cached_data(cache_key)
        if cached_data:
            return cached_data

        try:
            # Получаем исторические данные
            historical_data = await self.get_historical_data(symbol, timeframe, limit)
            
            # Рассчитываем индикаторы
            indicators = {
                "rsi": self._calculate_rsi(historical_data),
                "macd": self._calculate_macd(historical_data),
                "bollinger": self._calculate_bollinger_bands(historical_data),
                "stoch": self._calculate_stochastic(historical_data),
                "adx": self._calculate_adx(historical_data),
                "obv": self._calculate_obv(historical_data),
                "ichimoku": self._calculate_ichimoku(historical_data)
            }
            
            self._cache_data(cache_key, indicators)
            return indicators

        except Exception as e:
            logger.error(f"Error calculating indicators: {str(e)}")
            raise 