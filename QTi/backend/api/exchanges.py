from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.exchange_service import exchange_service
from core.exchanges.base import (
    MarketInfo,
    OrderBook,
    Trade,
    Order,
    Position,
    Balance
)

router = APIRouter(prefix='/api/exchanges', tags=['exchanges'])

class ExchangeConfig(BaseModel):
    api_key: str
    api_secret: str
    testnet: bool = False

class OrderCreate(BaseModel):
    symbol: str
    market_type: str
    side: str
    type: str
    quantity: float
    price: Optional[float] = None
    stop_price: Optional[float] = None
    leverage: Optional[float] = None
    margin_type: Optional[str] = None

@router.get('/supported')
async def get_supported_exchanges() -> List[Dict]:
    """Get list of supported exchanges"""
    return await exchange_service.get_supported_exchanges()

@router.get('/{exchange}/status')
async def get_exchange_status(exchange: str) -> Dict:
    """Get exchange connection status"""
    return await exchange_service.get_exchange_status(exchange)

@router.get('/{exchange}/config')
async def get_exchange_config(exchange: str) -> Dict:
    """Get exchange configuration"""
    return await exchange_service.get_exchange_config(exchange)

@router.post('/{exchange}/config')
async def update_exchange_config(exchange: str, config: ExchangeConfig) -> Dict:
    """Update exchange configuration"""
    return await exchange_service.update_exchange_config(exchange, config.dict())

@router.get('/{exchange}/markets/{market_type}')
async def get_markets(exchange: str, market_type: str) -> List[MarketInfo]:
    """Get list of markets"""
    return await exchange_service.get_markets(exchange, market_type)

@router.get('/{exchange}/orderbook/{symbol}/{market_type}')
async def get_order_book(
    exchange: str,
    symbol: str,
    market_type: str,
    limit: int = 100
) -> OrderBook:
    """Get order book"""
    return await exchange_service.get_order_book(exchange, symbol, market_type, limit)

@router.get('/{exchange}/trades/{symbol}/{market_type}')
async def get_trades(
    exchange: str,
    symbol: str,
    market_type: str,
    limit: int = 100
) -> List[Trade]:
    """Get recent trades"""
    return await exchange_service.get_trades(exchange, symbol, market_type, limit)

@router.post('/{exchange}/orders')
async def create_order(exchange: str, order: OrderCreate) -> Order:
    """Create new order"""
    return await exchange_service.create_order(exchange, order.dict())

@router.delete('/{exchange}/orders/{symbol}/{market_type}/{order_id}')
async def cancel_order(
    exchange: str,
    symbol: str,
    market_type: str,
    order_id: str
) -> Order:
    """Cancel order"""
    return await exchange_service.cancel_order(exchange, symbol, market_type, order_id)

@router.get('/{exchange}/orders')
async def get_open_orders(
    exchange: str,
    symbol: Optional[str] = None,
    market_type: Optional[str] = None
) -> List[Order]:
    """Get list of open orders"""
    return await exchange_service.get_open_orders(exchange, symbol, market_type)

@router.get('/{exchange}/orders/history')
async def get_order_history(
    exchange: str,
    symbol: Optional[str] = None,
    market_type: Optional[str] = None,
    limit: int = 100
) -> List[Order]:
    """Get order history"""
    return await exchange_service.get_order_history(exchange, symbol, market_type, limit)

@router.get('/{exchange}/positions')
async def get_positions(
    exchange: str,
    symbol: Optional[str] = None
) -> List[Position]:
    """Get list of positions"""
    return await exchange_service.get_positions(exchange, symbol)

@router.get('/{exchange}/balance')
async def get_balance(
    exchange: str,
    asset: Optional[str] = None
) -> List[Balance]:
    """Get account balance"""
    return await exchange_service.get_balance(exchange, asset)

@router.post('/{exchange}/test')
async def test_connection(exchange: str, config: ExchangeConfig) -> Dict:
    """Test exchange connection"""
    return await exchange_service.test_connection(exchange, config.dict()) 