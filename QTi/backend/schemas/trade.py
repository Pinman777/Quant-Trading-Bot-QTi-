from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import constr, confloat
from .base import BaseSchema

class TradeBase(BaseSchema):
    """
    Базовая схема сделки.
    """
    symbol: constr(min_length=1)
    side: constr(regex="^(buy|sell)$")
    type: constr(regex="^(market|limit)$")
    price: confloat(gt=0)
    amount: confloat(gt=0)
    cost: confloat(gt=0)
    fee: confloat(ge=0)
    fee_currency: constr(min_length=1)
    order_id: constr(min_length=1)
    status: constr(min_length=1)
    executed_at: datetime

class TradeCreate(TradeBase):
    """
    Схема для создания сделки.
    """
    strategy_id: int
    exchange_id: int
    metadata: Optional[Dict[str, Any]] = None

class TradeUpdate(BaseSchema):
    """
    Схема для обновления сделки.
    """
    status: Optional[constr(min_length=1)] = None
    metadata: Optional[Dict[str, Any]] = None

class TradeInDB(TradeBase):
    """
    Схема сделки в базе данных.
    """
    id: int
    strategy_id: int
    exchange_id: int
    metadata: Optional[Dict[str, Any]] = None

class TradeResponse(TradeInDB):
    """
    Схема для ответа с данными сделки.
    """
    pass

class TradeFilter(BaseSchema):
    """
    Схема для фильтрации сделок.
    """
    strategy_id: Optional[int] = None
    exchange_id: Optional[int] = None
    symbol: Optional[str] = None
    side: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TradeStats(BaseSchema):
    """
    Схема для статистики сделок.
    """
    total_trades: int
    total_volume: float
    total_fees: float
    profit_loss: float
    win_rate: float
    average_trade: float
    best_trade: float
    worst_trade: float 