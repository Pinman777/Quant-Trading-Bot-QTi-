from typing import Dict, List, Optional
from datetime import datetime
from fastapi import HTTPException
from core.exchanges.factory import ExchangeFactory
from core.exchanges.base import (
    MarketInfo,
    OrderBook,
    Trade,
    Order,
    Position,
    Balance
)

class ExchangeService:
    def __init__(self):
        self._exchanges: Dict[str, any] = {}

    async def get_supported_exchanges(self) -> List[Dict]:
        """Get list of supported exchanges"""
        return list(ExchangeFactory.get_supported_exchanges().values())

    async def get_exchange_status(self, exchange: str) -> Dict:
        """Get exchange connection status"""
        if exchange not in self._exchanges:
            return {
                'is_connected': False,
                'last_update': datetime.now().timestamp()
            }

        try:
            is_connected = await self._exchanges[exchange].test_connection()
            return {
                'is_connected': is_connected,
                'last_update': datetime.now().timestamp()
            }
        except Exception as e:
            return {
                'is_connected': False,
                'last_update': datetime.now().timestamp(),
                'error': str(e)
            }

    async def get_exchange_config(self, exchange: str) -> Dict:
        """Get exchange configuration"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        return {
            'name': exchange,
            'api_key': self._exchanges[exchange].api_key,
            'api_secret': self._exchanges[exchange].api_secret,
            'testnet': self._exchanges[exchange].testnet,
            'markets': ExchangeFactory.get_supported_exchanges()[exchange]['supported_markets']
        }

    async def update_exchange_config(self, exchange: str, config: Dict) -> Dict:
        """Update exchange configuration"""
        try:
            # Close existing connection if any
            if exchange in self._exchanges:
                await self._exchanges[exchange].close()

            # Create new exchange instance
            self._exchanges[exchange] = ExchangeFactory.create(
                exchange,
                config['api_key'],
                config['api_secret'],
                config.get('testnet', False)
            )

            # Initialize exchange
            await self._exchanges[exchange].initialize()

            return await self.get_exchange_config(exchange)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_markets(self, exchange: str, market_type: str) -> List[MarketInfo]:
        """Get list of markets"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_markets(market_type)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_order_book(
        self,
        exchange: str,
        symbol: str,
        market_type: str,
        limit: int = 100
    ) -> OrderBook:
        """Get order book"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_order_book(symbol, market_type, limit)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_trades(
        self,
        exchange: str,
        symbol: str,
        market_type: str,
        limit: int = 100
    ) -> List[Trade]:
        """Get recent trades"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_trades(symbol, market_type, limit)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def create_order(
        self,
        exchange: str,
        order: Dict
    ) -> Order:
        """Create new order"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].create_order(
                symbol=order['symbol'],
                market_type=order['market_type'],
                side=order['side'],
                order_type=order['type'],
                quantity=order['quantity'],
                price=order.get('price'),
                stop_price=order.get('stop_price'),
                leverage=order.get('leverage'),
                margin_type=order.get('margin_type')
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def cancel_order(
        self,
        exchange: str,
        symbol: str,
        market_type: str,
        order_id: str
    ) -> Order:
        """Cancel order"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].cancel_order(symbol, market_type, order_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_open_orders(
        self,
        exchange: str,
        symbol: Optional[str] = None,
        market_type: Optional[str] = None
    ) -> List[Order]:
        """Get list of open orders"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_open_orders(symbol, market_type)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_order_history(
        self,
        exchange: str,
        symbol: Optional[str] = None,
        market_type: Optional[str] = None,
        limit: int = 100
    ) -> List[Order]:
        """Get order history"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_order_history(symbol, market_type, limit)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_positions(
        self,
        exchange: str,
        symbol: Optional[str] = None
    ) -> List[Position]:
        """Get list of positions"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_positions(symbol)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_balance(
        self,
        exchange: str,
        asset: Optional[str] = None
    ) -> List[Balance]:
        """Get account balance"""
        if exchange not in self._exchanges:
            raise HTTPException(status_code=404, detail=f'Exchange {exchange} not configured')

        try:
            return await self._exchanges[exchange].get_balance(asset)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def test_connection(self, exchange: str, config: Dict) -> Dict:
        """Test exchange connection"""
        try:
            # Create temporary exchange instance
            temp_exchange = ExchangeFactory.create(
                exchange,
                config['api_key'],
                config['api_secret'],
                config.get('testnet', False)
            )

            # Initialize exchange
            await temp_exchange.initialize()

            # Test connection
            is_connected = await temp_exchange.test_connection()

            # Close connection
            await temp_exchange.close()

            return {
                'is_connected': is_connected,
                'last_update': datetime.now().timestamp()
            }
        except Exception as e:
            return {
                'is_connected': False,
                'last_update': datetime.now().timestamp(),
                'error': str(e)
            }

    async def close(self) -> None:
        """Close all exchange connections"""
        for exchange in self._exchanges.values():
            try:
                await exchange.close()
            except:
                pass
        self._exchanges.clear()

exchange_service = ExchangeService() 