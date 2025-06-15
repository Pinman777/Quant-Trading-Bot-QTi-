from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from decimal import Decimal

class Exchange(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.api_key = config.get("api_key")
        self.api_secret = config.get("api_secret")
        self.testnet = config.get("testnet", False)

    @abstractmethod
    async def get_balance(self, asset: str) -> Decimal:
        """Get balance for a specific asset."""
        pass

    @abstractmethod
    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get current ticker data for a symbol."""
        pass

    @abstractmethod
    async def get_order_book(self, symbol: str, limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
        """Get order book for a symbol."""
        pass

    @abstractmethod
    async def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get candlestick data."""
        pass

    @abstractmethod
    async def create_order(
        self,
        symbol: str,
        side: str,
        order_type: str,
        quantity: Decimal,
        price: Optional[Decimal] = None,
        stop_price: Optional[Decimal] = None,
        time_in_force: str = "GTC"
    ) -> Dict[str, Any]:
        """Create a new order."""
        pass

    @abstractmethod
    async def cancel_order(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Cancel an existing order."""
        pass

    @abstractmethod
    async def get_order(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Get order details."""
        pass

    @abstractmethod
    async def get_open_orders(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all open orders."""
        pass

    @abstractmethod
    async def get_position(self, symbol: str) -> Dict[str, Any]:
        """Get current position for a symbol."""
        pass

    @abstractmethod
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get all current positions."""
        pass

    @abstractmethod
    async def set_leverage(self, symbol: str, leverage: int) -> Dict[str, Any]:
        """Set leverage for a symbol."""
        pass

    @abstractmethod
    async def set_margin_type(self, symbol: str, margin_type: str) -> Dict[str, Any]:
        """Set margin type for a symbol."""
        pass

    @abstractmethod
    async def get_funding_rate(self, symbol: str) -> Dict[str, Any]:
        """Get current funding rate for a symbol."""
        pass

    @abstractmethod
    async def get_funding_history(
        self,
        symbol: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get funding history for a symbol."""
        pass

    @abstractmethod
    async def get_trade_history(
        self,
        symbol: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get trade history for a symbol."""
        pass

    @abstractmethod
    async def get_income_history(
        self,
        symbol: Optional[str] = None,
        income_type: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get income history."""
        pass

    @abstractmethod
    async def get_account_info(self) -> Dict[str, Any]:
        """Get account information."""
        pass

    @abstractmethod
    async def get_exchange_info(self) -> Dict[str, Any]:
        """Get exchange information."""
        pass

    @abstractmethod
    async def get_symbol_info(self, symbol: str) -> Dict[str, Any]:
        """Get symbol information."""
        pass

    @abstractmethod
    async def get_server_time(self) -> Dict[str, Any]:
        """Get server time."""
        pass

    @abstractmethod
    async def get_system_status(self) -> Dict[str, Any]:
        """Get system status."""
        pass

    @abstractmethod
    async def get_deposit_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get deposit history."""
        pass

    @abstractmethod
    async def get_withdraw_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get withdrawal history."""
        pass

    @abstractmethod
    async def get_dust_log(self) -> List[Dict[str, Any]]:
        """Get dust log."""
        pass

    @abstractmethod
    async def get_asset_dividend_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get asset dividend history."""
        pass 