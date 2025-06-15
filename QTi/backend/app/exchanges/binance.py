from typing import Dict, Any, List, Optional
from decimal import Decimal
import hmac
import hashlib
import time
import aiohttp
from .base import Exchange

class BinanceExchange(Exchange):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.base_url = "https://testnet.binance.vision" if self.testnet else "https://api.binance.com"
        self.futures_url = f"{self.base_url}/fapi/v1"
        self.spot_url = f"{self.base_url}/api/v3"
        self.session = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    async def close(self):
        """Close aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()

    def _generate_signature(self, params: Dict[str, Any]) -> str:
        """Generate signature for authenticated requests."""
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        signature = hmac.new(
            self.api_secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return signature

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        signed: bool = False
    ) -> Dict[str, Any]:
        """Make HTTP request to Binance API."""
        session = await self._get_session()
        
        if params is None:
            params = {}
        
        if signed:
            params["timestamp"] = int(time.time() * 1000)
            params["signature"] = self._generate_signature(params)
            headers = {"X-MBX-APIKEY": self.api_key}
        else:
            headers = {}
        
        url = f"{self.futures_url}/{endpoint}"
        
        async with session.request(method, url, params=params, headers=headers) as response:
            if response.status != 200:
                error = await response.json()
                raise Exception(f"Binance API error: {error}")
            
            return await response.json()

    async def get_balance(self, asset: str) -> Decimal:
        """Get balance for a specific asset."""
        data = await self._request("GET", "balance", signed=True)
        for balance in data:
            if balance["asset"] == asset:
                return Decimal(balance["free"])
        return Decimal("0")

    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get current ticker data for a symbol."""
        return await self._request("GET", "ticker/24hr", {"symbol": symbol})

    async def get_order_book(self, symbol: str, limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
        """Get order book for a symbol."""
        data = await self._request("GET", "depth", {"symbol": symbol, "limit": limit})
        return {
            "bids": [{"price": Decimal(price), "quantity": Decimal(qty)} for price, qty in data["bids"]],
            "asks": [{"price": Decimal(price), "quantity": Decimal(qty)} for price, qty in data["asks"]]
        }

    async def get_candles(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get candlestick data."""
        params = {
            "symbol": symbol,
            "interval": timeframe,
            "limit": limit
        }
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        data = await self._request("GET", "klines", params)
        return [
            {
                "time": candle[0],
                "open": Decimal(candle[1]),
                "high": Decimal(candle[2]),
                "low": Decimal(candle[3]),
                "close": Decimal(candle[4]),
                "volume": Decimal(candle[5])
            }
            for candle in data
        ]

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
        params = {
            "symbol": symbol,
            "side": side.upper(),
            "type": order_type.upper(),
            "quantity": str(quantity),
            "timeInForce": time_in_force
        }
        
        if price:
            params["price"] = str(price)
        if stop_price:
            params["stopPrice"] = str(stop_price)
        
        return await self._request("POST", "order", params, signed=True)

    async def cancel_order(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Cancel an existing order."""
        params = {
            "symbol": symbol,
            "orderId": order_id
        }
        return await self._request("DELETE", "order", params, signed=True)

    async def get_order(self, symbol: str, order_id: str) -> Dict[str, Any]:
        """Get order details."""
        params = {
            "symbol": symbol,
            "orderId": order_id
        }
        return await self._request("GET", "order", params, signed=True)

    async def get_open_orders(self, symbol: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all open orders."""
        params = {}
        if symbol:
            params["symbol"] = symbol
        return await self._request("GET", "openOrders", params, signed=True)

    async def get_position(self, symbol: str) -> Dict[str, Any]:
        """Get current position for a symbol."""
        positions = await self.get_positions()
        for position in positions:
            if position["symbol"] == symbol:
                return position
        return {}

    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get all current positions."""
        return await self._request("GET", "positionRisk", signed=True)

    async def set_leverage(self, symbol: str, leverage: int) -> Dict[str, Any]:
        """Set leverage for a symbol."""
        params = {
            "symbol": symbol,
            "leverage": leverage
        }
        return await self._request("POST", "leverage", params, signed=True)

    async def set_margin_type(self, symbol: str, margin_type: str) -> Dict[str, Any]:
        """Set margin type for a symbol."""
        params = {
            "symbol": symbol,
            "marginType": margin_type.upper()
        }
        return await self._request("POST", "marginType", params, signed=True)

    async def get_funding_rate(self, symbol: str) -> Dict[str, Any]:
        """Get current funding rate for a symbol."""
        params = {"symbol": symbol}
        return await self._request("GET", "premiumIndex", params)

    async def get_funding_history(
        self,
        symbol: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get funding history for a symbol."""
        params = {
            "symbol": symbol,
            "limit": limit
        }
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "income", params, signed=True)

    async def get_trade_history(
        self,
        symbol: str,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get trade history for a symbol."""
        params = {
            "symbol": symbol,
            "limit": limit
        }
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "userTrades", params, signed=True)

    async def get_income_history(
        self,
        symbol: Optional[str] = None,
        income_type: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get income history."""
        params = {"limit": limit}
        if symbol:
            params["symbol"] = symbol
        if income_type:
            params["incomeType"] = income_type
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "income", params, signed=True)

    async def get_account_info(self) -> Dict[str, Any]:
        """Get account information."""
        return await self._request("GET", "account", signed=True)

    async def get_exchange_info(self) -> Dict[str, Any]:
        """Get exchange information."""
        return await self._request("GET", "exchangeInfo")

    async def get_symbol_info(self, symbol: str) -> Dict[str, Any]:
        """Get symbol information."""
        data = await self.get_exchange_info()
        for s in data["symbols"]:
            if s["symbol"] == symbol:
                return s
        return {}

    async def get_server_time(self) -> Dict[str, Any]:
        """Get server time."""
        return await self._request("GET", "time")

    async def get_system_status(self) -> Dict[str, Any]:
        """Get system status."""
        return await self._request("GET", "systemStatus")

    async def get_deposit_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get deposit history."""
        params = {"limit": limit}
        if asset:
            params["coin"] = asset
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "depositHistory", params, signed=True)

    async def get_withdraw_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get withdrawal history."""
        params = {"limit": limit}
        if asset:
            params["coin"] = asset
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "withdrawHistory", params, signed=True)

    async def get_dust_log(self) -> List[Dict[str, Any]]:
        """Get dust log."""
        return await self._request("GET", "userAssetDribbletLog", signed=True)

    async def get_asset_dividend_history(
        self,
        asset: Optional[str] = None,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get asset dividend history."""
        params = {"limit": limit}
        if asset:
            params["asset"] = asset
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        return await self._request("GET", "assetDividend", params, signed=True) 