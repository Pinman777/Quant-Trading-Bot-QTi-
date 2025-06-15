import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio
import aiohttp
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration from JSON file"""
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load config from {config_path}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load configuration")

def save_config(config_path: str, config: Dict[str, Any]):
    """Save configuration to JSON file"""
    try:
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save config to {config_path}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save configuration")

async def make_async_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, Any]] = None,
    data: Optional[Dict[str, Any]] = None,
    timeout: int = 30
) -> Dict[str, Any]:
    """Make asynchronous HTTP request"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method,
                url,
                headers=headers,
                params=params,
                json=data,
                timeout=timeout
            ) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise HTTPException(
                        status_code=response.status,
                        detail=error_data.get("message", "Request failed")
                    )
                return await response.json()
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout")
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Request failed")

def format_timestamp(timestamp: datetime) -> str:
    """Format timestamp for display"""
    return timestamp.strftime("%Y-%m-%d %H:%M:%S")

def format_number(number: float, decimals: int = 2) -> str:
    """Format number for display"""
    return f"{number:,.{decimals}f}"

def format_percentage(number: float, decimals: int = 2) -> str:
    """Format percentage for display"""
    return f"{number:+.{decimals}f}%"

def format_currency(number: float, currency: str = "USD") -> str:
    """Format currency for display"""
    return f"{currency} {format_number(number)}"

def calculate_percentage_change(old_value: float, new_value: float) -> float:
    """Calculate percentage change"""
    if old_value == 0:
        return 0
    return ((new_value - old_value) / old_value) * 100

def validate_timeframe(timeframe: str) -> bool:
    """Validate timeframe string"""
    valid_timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"]
    return timeframe in valid_timeframes

def validate_symbol(symbol: str) -> bool:
    """Validate cryptocurrency symbol"""
    return bool(symbol and symbol.isupper() and len(symbol) <= 10)

def validate_exchange(exchange: str) -> bool:
    """Validate exchange name"""
    valid_exchanges = ["binance", "bybit", "okx"]
    return exchange.lower() in valid_exchanges 