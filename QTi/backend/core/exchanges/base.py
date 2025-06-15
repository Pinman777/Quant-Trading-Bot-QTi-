from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Union, Tuple
from datetime import datetime
from pydantic import BaseModel

class MarketInfo(BaseModel):
    symbol: str
    base_asset: str
    quote_asset: str
    market_type: str
    min_price: float
    max_price: float
    tick_size: float
    min_qty: float
    max_qty: float
    step_size: float
    min_notional: float
    is_active: bool
    leverage: Optional[int] = None
    margin_type: Optional[str] = None

class OrderBook(BaseModel):
    symbol: str
    market_type: str
    bids: List[Tuple[float, float]]
    asks: List[Tuple[float, float]]
    timestamp: datetime

class Trade(BaseModel):
    symbol: str
    market_type: str
    side: str
    price: float
    quantity: float
    timestamp: datetime
    order_id: str
    client_order_id: Optional[str] = None

class Order(BaseModel):
    symbol: str
    market_type: str
    order_id: str
    client_order_id: Optional[str] = None
    side: str
    type: str
    status: str
    price: float
    quantity: float
    filled_quantity: float
    remaining_quantity: float
    timestamp: datetime
    update_time: datetime
    leverage: Optional[int] = None
    margin_type: Optional[str] = None

class Position(BaseModel):
    symbol: str
    market_type: str
    side: str
    entry_price: float
    mark_price: float
    quantity: float
    leverage: int
    margin_type: str
    liquidation_price: float
    unrealized_pnl: float
    realized_pnl: float
    timestamp: datetime

class Balance(BaseModel):
    asset: str
    free: float
    locked: float
    total: float

class ExchangeBase(ABC):
    def __init__(self, api_key: str, api_secret: str, testnet: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self._client = None

    @abstractmethod
    async def initialize(self) -> None:
        """Initialize exchange client"""
        pass

    @abstractmethod
    async def get_markets(self, market_type: str) -> List[MarketInfo]:
        """Get list of available markets"""
        pass

    @abstractmethod
    async def get_order_book(self, symbol: str, market_type: str, limit: int = 100) -> OrderBook:
        """Get order book for symbol"""
        pass

    @abstractmethod
    async def get_trades(self, symbol: str, market_type: str, limit: int = 100) -> List[Trade]:
        """Get recent trades for symbol"""
        pass

    @abstractmethod
    async def create_order(
        self,
        symbol: str,
        market_type: str,
        side: str,
        order_type: str,
        quantity: float,
        price: Optional[float] = None,
        stop_price: Optional[float] = None,
        leverage: Optional[int] = None,
        margin_type: Optional[str] = None
    ) -> Order:
        """Create new order"""
        pass

    @abstractmethod
    async def cancel_order(self, symbol: str, market_type: str, order_id: str) -> Order:
        """Cancel order"""
        pass

    @abstractmethod
    async def get_open_orders(
        self,
        symbol: Optional[str] = None,
        market_type: Optional[str] = None
    ) -> List[Order]:
        """Get list of open orders"""
        pass

    @abstractmethod
    async def get_order_history(
        self,
        symbol: Optional[str] = None,
        market_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Order]:
        """Get order history"""
        pass

    @abstractmethod
    async def get_positions(self, symbol: Optional[str] = None) -> List[Position]:
        """Get list of positions (for futures)"""
        pass

    @abstractmethod
    async def get_balance(self, asset: Optional[str] = None) -> List[Balance]:
        """Get account balance"""
        pass

    @abstractmethod
    async def get_exchange_info(self) -> Dict:
        """Get exchange information"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test connection to exchange"""
        pass

    @abstractmethod
    async def close(self) -> None:
        """Close exchange connection"""
        pass 