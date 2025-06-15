import os
import json
from datetime import datetime, timedelta
from typing import List, Optional
import ccxt
from fastapi import HTTPException
from ..schemas.market import MarketData, CandleData, SymbolData, Timeframe

class MarketService:
    def __init__(self):
        self.exchange = ccxt.binance({
            'enableRateLimit': True,
            'options': {
                'defaultType': 'future'
            }
        })
        self.timeframes = [
            Timeframe(value='1h', label='1 Hour', description='1 hour candles'),
            Timeframe(value='4h', label='4 Hours', description='4 hour candles'),
            Timeframe(value='1d', label='1 Day', description='1 day candles'),
            Timeframe(value='1w', label='1 Week', description='1 week candles'),
        ]
        self.cache_dir = os.path.join(os.path.dirname(__file__), '../data/market')
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_cache_path(self, symbol: str, timeframe: str) -> str:
        return os.path.join(self.cache_dir, f'{symbol}_{timeframe}.json')

    def _load_cached_data(self, symbol: str, timeframe: str) -> Optional[SymbolData]:
        cache_path = self._get_cache_path(symbol, timeframe)
        if os.path.exists(cache_path):
            with open(cache_path, 'r') as f:
                data = json.load(f)
                return SymbolData(**data)
        return None

    def _save_cached_data(self, data: SymbolData) -> None:
        cache_path = self._get_cache_path(data.symbol, data.timeframe)
        with open(cache_path, 'w') as f:
            json.dump(data.dict(), f, default=str)

    def get_market_data(self) -> List[MarketData]:
        try:
            tickers = self.exchange.fetch_tickers()
            market_data = []
            
            for symbol, ticker in tickers.items():
                if symbol.endswith('USDT'):
                    market_data.append(MarketData(
                        symbol=symbol,
                        price=ticker['last'],
                        change24h=ticker['percentage'],
                        volume24h=ticker['quoteVolume'],
                        marketCap=ticker['quoteVolume'] * ticker['last'],
                        high24h=ticker['high'],
                        low24h=ticker['low']
                    ))
            
            return sorted(market_data, key=lambda x: x.marketCap, reverse=True)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_symbol_data(self, symbol: str, timeframe: str) -> SymbolData:
        try:
            # Check cache first
            cached_data = self._load_cached_data(symbol, timeframe)
            if cached_data and (datetime.now() - cached_data.lastUpdate) < timedelta(minutes=5):
                return cached_data

            # Fetch new data
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=100)
            candles = [
                CandleData(
                    timestamp=datetime.fromtimestamp(candle[0] / 1000),
                    open=candle[1],
                    high=candle[2],
                    low=candle[3],
                    close=candle[4],
                    volume=candle[5]
                )
                for candle in ohlcv
            ]

            symbol_data = SymbolData(
                symbol=symbol,
                timeframe=timeframe,
                candles=candles,
                lastUpdate=datetime.now()
            )

            # Cache the data
            self._save_cached_data(symbol_data)
            return symbol_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_symbols(self) -> List[str]:
        try:
            markets = self.exchange.load_markets()
            return [symbol for symbol in markets.keys() if symbol.endswith('USDT')]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_timeframes(self) -> List[Timeframe]:
        return self.timeframes 