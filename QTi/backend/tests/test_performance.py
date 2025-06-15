import pytest
import time
from fastapi import status
from app.config import settings

def test_response_time(authorized_client):
    start_time = time.time()
    response = authorized_client.get("/api/v1/auth/me")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 0.1  # Response time should be less than 100ms

def test_concurrent_requests(authorized_client):
    import asyncio
    import aiohttp
    
    async def make_request():
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "http://localhost:8000/api/v1/auth/me",
                headers={"Authorization": f"Bearer {authorized_client.headers['Authorization']}"}
            ) as response:
                return await response.status()
    
    # Make 100 concurrent requests
    loop = asyncio.get_event_loop()
    tasks = [make_request() for _ in range(100)]
    start_time = time.time()
    results = loop.run_until_complete(asyncio.gather(*tasks))
    end_time = time.time()
    
    # Verify all requests were successful
    assert all(status == 200 for status in results)
    # Verify total time is reasonable
    assert end_time - start_time < 5  # Should handle 100 requests in less than 5 seconds

def test_database_performance(authorized_client):
    # Create multiple bots
    start_time = time.time()
    for i in range(100):
        response = authorized_client.post(
            "/api/v1/bots",
            json={
                "name": f"Test Bot {i}",
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "config": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "strategy": "grid"
                }
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
    end_time = time.time()
    
    # Verify creation time is reasonable
    assert end_time - start_time < 10  # Should create 100 bots in less than 10 seconds
    
    # Test retrieval performance
    start_time = time.time()
    response = authorized_client.get("/api/v1/bots")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 100
    assert end_time - start_time < 1  # Should retrieve 100 bots in less than 1 second

def test_cache_performance(authorized_client):
    # Set cache
    start_time = time.time()
    for i in range(1000):
        response = authorized_client.post(
            f"/api/v1/cache/test_key_{i}",
            json={"value": f"test_value_{i}"}
        )
        assert response.status_code == status.HTTP_200_OK
    end_time = time.time()
    
    # Verify cache set performance
    assert end_time - start_time < 5  # Should set 1000 cache entries in less than 5 seconds
    
    # Test cache get performance
    start_time = time.time()
    for i in range(1000):
        response = authorized_client.get(f"/api/v1/cache/test_key_{i}")
        assert response.status_code == status.HTTP_200_OK
    end_time = time.time()
    
    # Verify cache get performance
    assert end_time - start_time < 5  # Should get 1000 cache entries in less than 5 seconds

def test_market_data_performance(authorized_client):
    # Test global metrics performance
    start_time = time.time()
    response = authorized_client.get("/api/v1/market/global")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 0.5  # Should get global metrics in less than 500ms
    
    # Test cryptocurrency list performance
    start_time = time.time()
    response = authorized_client.get("/api/v1/market/cryptocurrencies")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 1  # Should get cryptocurrency list in less than 1 second
    
    # Test OHLCV data performance
    start_time = time.time()
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 1000
        }
    )
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 1  # Should get OHLCV data in less than 1 second

def test_backtest_performance(authorized_client):
    # Create backtest
    start_time = time.time()
    response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    end_time = time.time()
    
    assert response.status_code == status.HTTP_201_CREATED
    assert end_time - start_time < 5  # Should create backtest in less than 5 seconds
    
    backtest_id = response.json()["id"]
    
    # Test results retrieval performance
    start_time = time.time()
    response = authorized_client.get(f"/api/v1/backtests/{backtest_id}/results")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 1  # Should get backtest results in less than 1 second

def test_optimization_performance(authorized_client):
    # Create optimization
    start_time = time.time()
    response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    end_time = time.time()
    
    assert response.status_code == status.HTTP_201_CREATED
    assert end_time - start_time < 5  # Should create optimization in less than 5 seconds
    
    optimization_id = response.json()["id"]
    
    # Test results retrieval performance
    start_time = time.time()
    response = authorized_client.get(f"/api/v1/optimizations/{optimization_id}/results")
    end_time = time.time()
    
    assert response.status_code == status.HTTP_200_OK
    assert end_time - start_time < 1  # Should get optimization results in less than 1 second

def test_memory_usage(authorized_client):
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_memory = process.memory_info().rss
    
    # Perform memory-intensive operations
    for i in range(1000):
        authorized_client.post(
            f"/api/v1/cache/test_key_{i}",
            json={"value": "x" * 1000}  # 1KB of data
        )
    
    final_memory = process.memory_info().rss
    memory_increase = final_memory - initial_memory
    
    # Verify memory usage is reasonable (less than 100MB increase)
    assert memory_increase < 100 * 1024 * 1024

def test_cpu_usage(authorized_client):
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    initial_cpu = process.cpu_percent()
    
    # Perform CPU-intensive operations
    for i in range(100):
        authorized_client.get(
            "/api/v1/market/cryptocurrencies/1/ohlcv",
            params={
                "timeframe": "1h",
                "limit": 1000
            }
        )
    
    final_cpu = process.cpu_percent()
    cpu_increase = final_cpu - initial_cpu
    
    # Verify CPU usage is reasonable (less than 50% increase)
    assert cpu_increase < 50 