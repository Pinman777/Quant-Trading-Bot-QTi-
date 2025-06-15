import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.market import router as market_router
from app.services.market_service import MarketService
from app.schemas.market import MarketData, OrderBook, Trade, Ticker
from app.core.config import settings
import json
import os

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(market_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def market_service():
    return MarketService()

def test_market_data_lifecycle(client, market_service):
    # Test complete market data lifecycle
    # Get market data
    response = client.get("/api/market/data/BTCUSDT")
    assert response.status_code == 200
    assert "symbol" in response.json()
    assert "price" in response.json()
    assert "volume" in response.json()
    assert "timestamp" in response.json()
    
    # Get order book
    response = client.get("/api/market/orderbook/BTCUSDT")
    assert response.status_code == 200
    assert "bids" in response.json()
    assert "asks" in response.json()
    assert "timestamp" in response.json()
    
    # Get trades
    response = client.get("/api/market/trades/BTCUSDT")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert "price" in response.json()[0]
    assert "amount" in response.json()[0]
    assert "timestamp" in response.json()[0]
    
    # Get ticker
    response = client.get("/api/market/ticker/BTCUSDT")
    assert response.status_code == 200
    assert "symbol" in response.json()
    assert "last_price" in response.json()
    assert "bid" in response.json()
    assert "ask" in response.json()
    assert "volume" in response.json()
    assert "timestamp" in response.json()

def test_market_data_validation(client, market_service):
    # Test market data validation
    # Test invalid symbol
    response = client.get("/api/market/data/INVALID")
    assert response.status_code == 404
    
    # Test invalid timeframe
    response = client.get("/api/market/data/BTCUSDT?timeframe=invalid")
    assert response.status_code == 422
    
    # Test invalid limit
    response = client.get("/api/market/trades/BTCUSDT?limit=1000")
    assert response.status_code == 422
    
    # Test invalid depth
    response = client.get("/api/market/orderbook/BTCUSDT?depth=1000")
    assert response.status_code == 422

def test_market_data_operations(client, market_service):
    # Test market data operations
    # Get multiple symbols
    response = client.get("/api/market/data?symbols=BTCUSDT,ETHUSDT,BNBUSDT")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 3
    
    # Get historical data
    response = client.get("/api/market/historical/BTCUSDT?timeframe=1h&limit=100")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 100
    assert "timestamp" in response.json()[0]
    assert "open" in response.json()[0]
    assert "high" in response.json()[0]
    assert "low" in response.json()[0]
    assert "close" in response.json()[0]
    assert "volume" in response.json()[0]
    
    # Get market depth
    response = client.get("/api/market/depth/BTCUSDT?limit=10")
    assert response.status_code == 200
    assert "bids" in response.json()
    assert "asks" in response.json()
    assert len(response.json()["bids"]) == 10
    assert len(response.json()["asks"]) == 10
    
    # Get market statistics
    response = client.get("/api/market/stats/BTCUSDT")
    assert response.status_code == 200
    assert "high_24h" in response.json()
    assert "low_24h" in response.json()
    assert "volume_24h" in response.json()
    assert "price_change_24h" in response.json()
    assert "price_change_percent_24h" in response.json()

def test_market_data_caching(client, market_service):
    # Test market data caching
    # Get market data first time
    response1 = client.get("/api/market/data/BTCUSDT")
    assert response1.status_code == 200
    
    # Get market data second time (should be cached)
    response2 = client.get("/api/market/data/BTCUSDT")
    assert response2.status_code == 200
    
    # Compare response times
    assert response2.elapsed < response1.elapsed
    
    # Get order book first time
    response1 = client.get("/api/market/orderbook/BTCUSDT")
    assert response1.status_code == 200
    
    # Get order book second time (should be cached)
    response2 = client.get("/api/market/orderbook/BTCUSDT")
    assert response2.status_code == 200
    
    # Compare response times
    assert response2.elapsed < response1.elapsed

def test_market_data_streaming(client, market_service):
    # Test market data streaming
    # Stream market data
    with client.stream("GET", "/api/market/stream/BTCUSDT") as response:
        assert response.status_code == 200
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                assert "symbol" in data
                assert "price" in data
                assert "volume" in data
                assert "timestamp" in data
                break
    
    # Stream order book
    with client.stream("GET", "/api/market/stream/orderbook/BTCUSDT") as response:
        assert response.status_code == 200
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                assert "bids" in data
                assert "asks" in data
                assert "timestamp" in data
                break
    
    # Stream trades
    with client.stream("GET", "/api/market/stream/trades/BTCUSDT") as response:
        assert response.status_code == 200
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                assert "price" in data
                assert "amount" in data
                assert "timestamp" in data
                break

def test_market_data_aggregation(client, market_service):
    # Test market data aggregation
    # Get aggregated trades
    response = client.get("/api/market/aggregated/trades/BTCUSDT?timeframe=1m")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert "timestamp" in response.json()[0]
    assert "open" in response.json()[0]
    assert "high" in response.json()[0]
    assert "low" in response.json()[0]
    assert "close" in response.json()[0]
    assert "volume" in response.json()[0]
    
    # Get aggregated order book
    response = client.get("/api/market/aggregated/orderbook/BTCUSDT?timeframe=1m")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert "timestamp" in response.json()[0]
    assert "bids" in response.json()[0]
    assert "asks" in response.json()[0]
    
    # Get aggregated statistics
    response = client.get("/api/market/aggregated/stats/BTCUSDT?timeframe=1h")
    assert response.status_code == 200
    assert "high" in response.json()
    assert "low" in response.json()
    assert "volume" in response.json()
    assert "price_change" in response.json()
    assert "price_change_percent" in response.json()

def test_market_data_analysis(client, market_service):
    # Test market data analysis
    # Get technical indicators
    response = client.get("/api/market/analysis/indicators/BTCUSDT?timeframe=1h")
    assert response.status_code == 200
    assert "sma" in response.json()
    assert "ema" in response.json()
    assert "rsi" in response.json()
    assert "macd" in response.json()
    assert "bollinger_bands" in response.json()
    
    # Get support and resistance levels
    response = client.get("/api/market/analysis/levels/BTCUSDT")
    assert response.status_code == 200
    assert "support" in response.json()
    assert "resistance" in response.json()
    
    # Get market sentiment
    response = client.get("/api/market/analysis/sentiment/BTCUSDT")
    assert response.status_code == 200
    assert "score" in response.json()
    assert "trend" in response.json()
    assert "strength" in response.json()
    
    # Get market correlation
    response = client.get("/api/market/analysis/correlation/BTCUSDT?symbols=ETHUSDT,BNBUSDT")
    assert response.status_code == 200
    assert "correlations" in response.json()
    assert "strength" in response.json()

def test_market_data_error_handling(client, market_service):
    # Test market data error handling
    # Test invalid symbol
    response = client.get("/api/market/data/INVALID")
    assert response.status_code == 404
    
    # Test invalid timeframe
    response = client.get("/api/market/data/BTCUSDT?timeframe=invalid")
    assert response.status_code == 422
    
    # Test invalid limit
    response = client.get("/api/market/trades/BTCUSDT?limit=1000")
    assert response.status_code == 422
    
    # Test invalid depth
    response = client.get("/api/market/orderbook/BTCUSDT?depth=1000")
    assert response.status_code == 422
    
    # Test invalid stream
    response = client.get("/api/market/stream/invalid")
    assert response.status_code == 404
    
    # Test invalid analysis
    response = client.get("/api/market/analysis/invalid/BTCUSDT")
    assert response.status_code == 404

def test_market_data_security(client, market_service):
    # Test market data security
    # Test rate limiting
    for _ in range(100):
        response = client.get("/api/market/data/BTCUSDT")
    
    assert response.status_code == 429
    
    # Test data validation
    response = client.get("/api/market/data/BTCUSDT?timeframe=1h&limit=100")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "symbol" in data
    assert "price" in data
    assert "volume" in data
    assert "timestamp" in data
    
    # Test data sanitization
    response = client.get("/api/market/data/BTCUSDT?timeframe=1h&limit=100&fields=price,volume")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "price" in data
    assert "volume" in data
    assert "symbol" not in data
    assert "timestamp" not in data 