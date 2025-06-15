from enum import Enum
from typing import Dict, Any

# API endpoints
API_PREFIX = "/api/v1"
AUTH_PREFIX = "/auth"
BOT_PREFIX = "/bots"
MARKET_PREFIX = "/market"
SERVER_PREFIX = "/servers"
BACKTEST_PREFIX = "/backtests"
OPTIMIZE_PREFIX = "/optimizations"

# Timeframes
class Timeframe(str, Enum):
    MINUTE = "1m"
    FIVE_MINUTES = "5m"
    FIFTEEN_MINUTES = "15m"
    THIRTY_MINUTES = "30m"
    HOUR = "1h"
    FOUR_HOURS = "4h"
    DAY = "1d"
    WEEK = "1w"
    MONTH = "1M"

# Exchanges
class Exchange(str, Enum):
    BINANCE = "binance"
    BYBIT = "bybit"
    OKX = "okx"

# Bot statuses
class BotStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    PENDING = "pending"

# Server statuses
class ServerStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"

# Cache durations (in seconds)
CACHE_DURATIONS: Dict[str, int] = {
    "global": 300,  # 5 minutes
    "cryptocurrencies": 300,  # 5 minutes
    "details": 300,  # 5 minutes
    "quotes": 60,  # 1 minute
}

# Default limits
DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 1000
DEFAULT_CACHE_SIZE = 1000

# File paths
CONFIG_DIR = "config"
CACHE_DIR = "cache"
LOG_DIR = "logs"
BOT_CONFIG_DIR = f"{CONFIG_DIR}/bots"
SERVER_CONFIG_DIR = f"{CONFIG_DIR}/servers"

# API response messages
MESSAGES: Dict[str, str] = {
    "success": "Operation completed successfully",
    "error": "An error occurred",
    "not_found": "Resource not found",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "validation_error": "Validation error",
    "server_error": "Server error",
    "bot_error": "Bot error",
    "market_error": "Market data error",
    "config_error": "Configuration error",
}

# Error codes
ERROR_CODES: Dict[str, int] = {
    "success": 200,
    "created": 201,
    "bad_request": 400,
    "unauthorized": 401,
    "forbidden": 403,
    "not_found": 404,
    "validation_error": 422,
    "server_error": 500,
    "bad_gateway": 502,
    "service_unavailable": 503,
} 