from typing import Dict, List, Optional
import ccxt
from sqlalchemy.orm import Session

from ..crud import exchange as crud_exchange
from ..schemas.exchange import ExchangeCreate, ExchangeUpdate

def get_exchange_client(exchange_id: str, api_key: str, api_secret: str) -> ccxt.Exchange:
    """
    Создает клиент для работы с биржей.
    """
    exchange_class = getattr(ccxt, exchange_id.lower())
    return exchange_class({
        'apiKey': api_key,
        'secret': api_secret,
        'enableRateLimit': True
    })

def get_exchange_balance(exchange: ccxt.Exchange) -> Dict:
    """
    Получает баланс на бирже.
    """
    try:
        balance = exchange.fetch_balance()
        return {
            'total': balance['total'],
            'free': balance['free'],
            'used': balance['used']
        }
    except Exception as e:
        raise Exception(f"Ошибка при получении баланса: {str(e)}")

def get_exchange_tickers(exchange: ccxt.Exchange) -> Dict:
    """
    Получает текущие цены всех пар на бирже.
    """
    try:
        return exchange.fetch_tickers()
    except Exception as e:
        raise Exception(f"Ошибка при получении цен: {str(e)}")

def get_exchange_order_book(exchange: ccxt.Exchange, symbol: str, limit: int = 20) -> Dict:
    """
    Получает книгу ордеров для указанной пары.
    """
    try:
        return exchange.fetch_order_book(symbol, limit)
    except Exception as e:
        raise Exception(f"Ошибка при получении книги ордеров: {str(e)}")

def create_exchange_order(
    exchange: ccxt.Exchange,
    symbol: str,
    order_type: str,
    side: str,
    amount: float,
    price: Optional[float] = None
) -> Dict:
    """
    Создает ордер на бирже.
    """
    try:
        return exchange.create_order(
            symbol=symbol,
            type=order_type,
            side=side,
            amount=amount,
            price=price
        )
    except Exception as e:
        raise Exception(f"Ошибка при создании ордера: {str(e)}")

def get_exchange_orders(
    exchange: ccxt.Exchange,
    symbol: Optional[str] = None,
    since: Optional[int] = None,
    limit: Optional[int] = None
) -> List[Dict]:
    """
    Получает историю ордеров.
    """
    try:
        return exchange.fetch_orders(symbol, since, limit)
    except Exception as e:
        raise Exception(f"Ошибка при получении ордеров: {str(e)}")

def cancel_exchange_order(exchange: ccxt.Exchange, order_id: str, symbol: str) -> Dict:
    """
    Отменяет ордер на бирже.
    """
    try:
        return exchange.cancel_order(order_id, symbol)
    except Exception as e:
        raise Exception(f"Ошибка при отмене ордера: {str(e)}")

def get_exchange_ohlcv(
    exchange: ccxt.Exchange,
    symbol: str,
    timeframe: str = '1m',
    since: Optional[int] = None,
    limit: Optional[int] = None
) -> List[List]:
    """
    Получает OHLCV данные для указанной пары.
    """
    try:
        return exchange.fetch_ohlcv(symbol, timeframe, since, limit)
    except Exception as e:
        raise Exception(f"Ошибка при получении OHLCV данных: {str(e)}")

def get_exchange_markets(exchange: ccxt.Exchange) -> Dict:
    """
    Получает список всех доступных торговых пар на бирже.
    """
    try:
        return exchange.load_markets()
    except Exception as e:
        raise Exception(f"Ошибка при получении списка пар: {str(e)}")

def get_exchange_funding_rate(exchange: ccxt.Exchange, symbol: str) -> Dict:
    """
    Получает текущую ставку финансирования для фьючерсной пары.
    """
    try:
        return exchange.fetch_funding_rate(symbol)
    except Exception as e:
        raise Exception(f"Ошибка при получении ставки финансирования: {str(e)}")

def get_exchange_funding_history(
    exchange: ccxt.Exchange,
    symbol: str,
    since: Optional[int] = None,
    limit: Optional[int] = None
) -> List[Dict]:
    """
    Получает историю финансирования для фьючерсной пары.
    """
    try:
        return exchange.fetch_funding_history(symbol, since, limit)
    except Exception as e:
        raise Exception(f"Ошибка при получении истории финансирования: {str(e)}") 