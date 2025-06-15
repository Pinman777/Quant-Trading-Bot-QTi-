from typing import Dict, Type
from .base import ExchangeBase
from .binance import BinanceExchange
from .bybit import BybitExchange
from .okx import OKXExchange
from .bingx import BingXExchange
from .bitget import BitgetExchange
from .blofin import BlofinExchange
from .gate import GateExchange
from .htx import HTXExchange
from .lbank import LBankExchange
from .mexc import MEXCExchange
from .hyperliquid import HyperliquidExchange
from .weex import WEEXExchange
from .bitunix import BitunixExchange

class ExchangeFactory:
    _exchanges: Dict[str, Type[ExchangeBase]] = {
        'binance': BinanceExchange,
        'bybit': BybitExchange,
        'okx': OKXExchange,
        'bingx': BingXExchange,
        'bitget': BitgetExchange,
        'blofin': BlofinExchange,
        'gate': GateExchange,
        'htx': HTXExchange,
        'lbank': LBankExchange,
        'mexc': MEXCExchange,
        'hyperliquid': HyperliquidExchange,
        'weex': WEEXExchange,
        'bitunix': BitunixExchange
    }

    @classmethod
    def create(cls, exchange: str, api_key: str, api_secret: str, testnet: bool = False) -> ExchangeBase:
        """
        Create exchange instance
        
        Args:
            exchange: Exchange name
            api_key: API key
            api_secret: API secret
            testnet: Use testnet
            
        Returns:
            Exchange instance
            
        Raises:
            ValueError: If exchange is not supported
        """
        if exchange not in cls._exchanges:
            raise ValueError(f'Exchange {exchange} is not supported')
            
        exchange_class = cls._exchanges[exchange]
        return exchange_class(api_key, api_secret, testnet)

    @classmethod
    def get_supported_exchanges(cls) -> Dict[str, Dict]:
        """
        Get supported exchanges information
        
        Returns:
            Dict with exchange information
        """
        return {
            'binance': {
                'name': 'Binance',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.00001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'bybit': {
                'name': 'Bybit',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'okx': {
                'name': 'OKX',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.00001,
                'trading_fees': {
                    'maker': 0.08,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'bingx': {
                'name': 'BingX',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'bitget': {
                'name': 'Bitget',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'blofin': {
                'name': 'Blofin',
                'supported_markets': ['futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.02,
                    'taker': 0.06
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'gate': {
                'name': 'Gate.io',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.2,
                    'taker': 0.2
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'htx': {
                'name': 'HTX',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.2,
                    'taker': 0.2
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'lbank': {
                'name': 'LBank',
                'supported_markets': ['spot'],
                'has_testnet': False,
                'max_leverage': 1,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market']
            },
            'mexc': {
                'name': 'MEXC',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 125,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.2,
                    'taker': 0.2
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'hyperliquid': {
                'name': 'Hyperliquid',
                'supported_markets': ['futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.02,
                    'taker': 0.06
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'weex': {
                'name': 'WEEX',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            },
            'bitunix': {
                'name': 'Bitunix',
                'supported_markets': ['spot', 'futures'],
                'has_testnet': True,
                'max_leverage': 100,
                'min_order_size': 0.001,
                'trading_fees': {
                    'maker': 0.1,
                    'taker': 0.1
                },
                'supported_timeframes': ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
                'supported_order_types': ['limit', 'market', 'stop', 'stop_limit']
            }
        } 