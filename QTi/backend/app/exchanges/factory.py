from typing import Dict, Any, Type, List
from .base import Exchange
from .binance import BinanceExchange

class ExchangeFactory:
    _exchanges: Dict[str, Type[Exchange]] = {
        "binance": BinanceExchange,
        # Add other exchanges here
    }

    @classmethod
    def create(cls, exchange_id: str, config: Dict[str, Any]) -> Exchange:
        """
        Create an exchange instance.
        
        Args:
            exchange_id: Exchange identifier (e.g., "binance")
            config: Exchange configuration
            
        Returns:
            Exchange instance
            
        Raises:
            ValueError: If exchange_id is not supported
        """
        exchange_class = cls._exchanges.get(exchange_id)
        if not exchange_class:
            raise ValueError(f"Unsupported exchange: {exchange_id}")
        
        return exchange_class(config)

    @classmethod
    def register_exchange(cls, exchange_id: str, exchange_class: Type[Exchange]):
        """
        Register a new exchange.
        
        Args:
            exchange_id: Exchange identifier
            exchange_class: Exchange class
        """
        cls._exchanges[exchange_id] = exchange_class

    @classmethod
    def get_supported_exchanges(cls) -> List[str]:
        """
        Get list of supported exchanges.
        
        Returns:
            List of exchange identifiers
        """
        return list(cls._exchanges.keys()) 