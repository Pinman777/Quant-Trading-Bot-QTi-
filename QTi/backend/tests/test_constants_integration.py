import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.constants import (
    API_PREFIX,
    AUTH_PREFIX,
    BOT_PREFIX,
    MARKET_PREFIX,
    SERVER_PREFIX,
    BACKTEST_PREFIX,
    OPTIMIZE_PREFIX,
    Timeframe,
    Exchange,
    BotStatus,
    ServerStatus,
    CACHE_DURATIONS,
    DEFAULT_LIMIT,
    DEFAULT_CACHE_SIZE,
    CONFIG_FILE,
    CACHE_DIR,
    LOG_DIR,
    BOT_CONFIG_DIR,
    SERVER_CONFIG_DIR,
    MESSAGES,
    ERROR_CODES
)
import json

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_api_prefixes(client):
    # Test API prefixes
    assert API_PREFIX == "/api/v1"
    assert AUTH_PREFIX == "/api/v1/auth"
    assert BOT_PREFIX == "/api/v1/bot"
    assert MARKET_PREFIX == "/api/v1/market"
    assert SERVER_PREFIX == "/api/v1/server"
    assert BACKTEST_PREFIX == "/api/v1/backtest"
    assert OPTIMIZE_PREFIX == "/api/v1/optimize"

def test_timeframe_enum(client):
    # Test Timeframe enum
    assert Timeframe.MINUTE.value == "1m"
    assert Timeframe.FIVE_MINUTES.value == "5m"
    assert Timeframe.FIFTEEN_MINUTES.value == "15m"
    assert Timeframe.THIRTY_MINUTES.value == "30m"
    assert Timeframe.HOUR.value == "1h"
    assert Timeframe.FOUR_HOURS.value == "4h"
    assert Timeframe.DAY.value == "1d"
    assert Timeframe.WEEK.value == "1w"
    assert Timeframe.MONTH.value == "1M"
    
    # Test enum iteration
    timeframes = [tf.value for tf in Timeframe]
    assert "1m" in timeframes
    assert "5m" in timeframes
    assert "15m" in timeframes
    assert "30m" in timeframes
    assert "1h" in timeframes
    assert "4h" in timeframes
    assert "1d" in timeframes
    assert "1w" in timeframes
    assert "1M" in timeframes

def test_exchange_enum(client):
    # Test Exchange enum
    assert Exchange.BINANCE.value == "binance"
    assert Exchange.BYBIT.value == "bybit"
    assert Exchange.OKX.value == "okx"
    
    # Test enum iteration
    exchanges = [ex.value for ex in Exchange]
    assert "binance" in exchanges
    assert "bybit" in exchanges
    assert "okx" in exchanges

def test_bot_status_enum(client):
    # Test BotStatus enum
    assert BotStatus.RUNNING.value == "running"
    assert BotStatus.STOPPED.value == "stopped"
    assert BotStatus.ERROR.value == "error"
    assert BotStatus.PENDING.value == "pending"
    
    # Test enum iteration
    statuses = [status.value for status in BotStatus]
    assert "running" in statuses
    assert "stopped" in statuses
    assert "error" in statuses
    assert "pending" in statuses

def test_server_status_enum(client):
    # Test ServerStatus enum
    assert ServerStatus.ONLINE.value == "online"
    assert ServerStatus.OFFLINE.value == "offline"
    assert ServerStatus.ERROR.value == "error"
    
    # Test enum iteration
    statuses = [status.value for status in ServerStatus]
    assert "online" in statuses
    assert "offline" in statuses
    assert "error" in statuses

def test_cache_durations(client):
    # Test cache durations
    assert CACHE_DURATIONS["market_data"] == 60
    assert CACHE_DURATIONS["user_data"] == 300
    assert CACHE_DURATIONS["bot_data"] == 60
    assert CACHE_DURATIONS["server_data"] == 60
    
    # Test cache duration types
    assert isinstance(CACHE_DURATIONS["market_data"], int)
    assert isinstance(CACHE_DURATIONS["user_data"], int)
    assert isinstance(CACHE_DURATIONS["bot_data"], int)
    assert isinstance(CACHE_DURATIONS["server_data"], int)
    
    # Test cache duration ranges
    assert CACHE_DURATIONS["market_data"] > 0
    assert CACHE_DURATIONS["user_data"] > 0
    assert CACHE_DURATIONS["bot_data"] > 0
    assert CACHE_DURATIONS["server_data"] > 0

def test_default_limits(client):
    # Test default limits
    assert DEFAULT_LIMIT == 100
    assert DEFAULT_CACHE_SIZE == 1000
    
    # Test limit types
    assert isinstance(DEFAULT_LIMIT, int)
    assert isinstance(DEFAULT_CACHE_SIZE, int)
    
    # Test limit ranges
    assert DEFAULT_LIMIT > 0
    assert DEFAULT_CACHE_SIZE > 0

def test_file_paths(client):
    # Test file paths
    assert CONFIG_FILE == "config.json"
    assert CACHE_DIR == "cache"
    assert LOG_DIR == "logs"
    assert BOT_CONFIG_DIR == "config/bot"
    assert SERVER_CONFIG_DIR == "config/server"
    
    # Test path types
    assert isinstance(CONFIG_FILE, str)
    assert isinstance(CACHE_DIR, str)
    assert isinstance(LOG_DIR, str)
    assert isinstance(BOT_CONFIG_DIR, str)
    assert isinstance(SERVER_CONFIG_DIR, str)

def test_messages(client):
    # Test messages
    assert MESSAGES["success"] == "Operation successful"
    assert MESSAGES["error"] == "Operation failed"
    assert MESSAGES["not_found"] == "Resource not found"
    assert MESSAGES["unauthorized"] == "Unauthorized access"
    assert MESSAGES["forbidden"] == "Access forbidden"
    
    # Test message types
    assert isinstance(MESSAGES["success"], str)
    assert isinstance(MESSAGES["error"], str)
    assert isinstance(MESSAGES["not_found"], str)
    assert isinstance(MESSAGES["unauthorized"], str)
    assert isinstance(MESSAGES["forbidden"], str)

def test_error_codes(client):
    # Test error codes
    assert ERROR_CODES[400] == "Bad Request"
    assert ERROR_CODES[401] == "Unauthorized"
    assert ERROR_CODES[403] == "Forbidden"
    assert ERROR_CODES[404] == "Not Found"
    assert ERROR_CODES[500] == "Internal Server Error"
    
    # Test error code types
    assert isinstance(ERROR_CODES[400], str)
    assert isinstance(ERROR_CODES[401], str)
    assert isinstance(ERROR_CODES[403], str)
    assert isinstance(ERROR_CODES[404], str)
    assert isinstance(ERROR_CODES[500], str)

def test_constant_validation(client):
    # Test constant validation
    # Test API prefix format
    assert API_PREFIX.startswith("/api/")
    assert AUTH_PREFIX.startswith("/api/")
    assert BOT_PREFIX.startswith("/api/")
    assert MARKET_PREFIX.startswith("/api/")
    assert SERVER_PREFIX.startswith("/api/")
    assert BACKTEST_PREFIX.startswith("/api/")
    assert OPTIMIZE_PREFIX.startswith("/api/")
    
    # Test timeframe format
    for tf in Timeframe:
        assert tf.value.endswith(("m", "h", "d", "w", "M"))
    
    # Test exchange format
    for ex in Exchange:
        assert ex.value.islower()
    
    # Test status format
    for status in BotStatus:
        assert status.value.islower()
    for status in ServerStatus:
        assert status.value.islower()
    
    # Test cache duration format
    for duration in CACHE_DURATIONS.values():
        assert isinstance(duration, int)
        assert duration > 0
    
    # Test limit format
    assert isinstance(DEFAULT_LIMIT, int)
    assert DEFAULT_LIMIT > 0
    assert isinstance(DEFAULT_CACHE_SIZE, int)
    assert DEFAULT_CACHE_SIZE > 0
    
    # Test file path format
    assert not CONFIG_FILE.startswith("/")
    assert not CACHE_DIR.startswith("/")
    assert not LOG_DIR.startswith("/")
    assert not BOT_CONFIG_DIR.startswith("/")
    assert not SERVER_CONFIG_DIR.startswith("/")
    
    # Test message format
    for message in MESSAGES.values():
        assert isinstance(message, str)
        assert len(message) > 0
    
    # Test error code format
    for code, message in ERROR_CODES.items():
        assert isinstance(code, int)
        assert isinstance(message, str)
        assert len(message) > 0

def test_constant_security(client):
    # Test constant security
    # Test API prefix security
    assert ".." not in API_PREFIX
    assert ".." not in AUTH_PREFIX
    assert ".." not in BOT_PREFIX
    assert ".." not in MARKET_PREFIX
    assert ".." not in SERVER_PREFIX
    assert ".." not in BACKTEST_PREFIX
    assert ".." not in OPTIMIZE_PREFIX
    
    # Test file path security
    assert ".." not in CONFIG_FILE
    assert ".." not in CACHE_DIR
    assert ".." not in LOG_DIR
    assert ".." not in BOT_CONFIG_DIR
    assert ".." not in SERVER_CONFIG_DIR
    
    # Test message security
    for message in MESSAGES.values():
        assert "<script>" not in message
        assert "javascript:" not in message
    
    # Test error code security
    for message in ERROR_CODES.values():
        assert "<script>" not in message
        assert "javascript:" not in message

def test_constant_performance(client):
    # Test constant performance
    import time
    
    # Test enum access performance
    start_time = time.time()
    for _ in range(1000):
        _ = Timeframe.MINUTE.value
        _ = Exchange.BINANCE.value
        _ = BotStatus.RUNNING.value
        _ = ServerStatus.ONLINE.value
    end_time = time.time()
    assert end_time - start_time < 1.0  # Should be fast
    
    # Test dictionary access performance
    start_time = time.time()
    for _ in range(1000):
        _ = CACHE_DURATIONS["market_data"]
        _ = MESSAGES["success"]
        _ = ERROR_CODES[400]
    end_time = time.time()
    assert end_time - start_time < 1.0  # Should be fast

def test_constant_concurrency(client):
    # Test constant concurrency
    import threading
    
    def access_constants():
        for _ in range(100):
            _ = Timeframe.MINUTE.value
            _ = Exchange.BINANCE.value
            _ = BotStatus.RUNNING.value
            _ = ServerStatus.ONLINE.value
            _ = CACHE_DURATIONS["market_data"]
            _ = MESSAGES["success"]
            _ = ERROR_CODES[400]
    
    # Create threads
    threads = []
    for _ in range(10):
        threads.append(threading.Thread(target=access_constants))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    assert Timeframe.MINUTE.value == "1m"
    assert Exchange.BINANCE.value == "binance"
    assert BotStatus.RUNNING.value == "running"
    assert ServerStatus.ONLINE.value == "online"
    assert CACHE_DURATIONS["market_data"] == 60
    assert MESSAGES["success"] == "Operation successful"
    assert ERROR_CODES[400] == "Bad Request" 