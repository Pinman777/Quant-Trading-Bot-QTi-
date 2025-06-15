from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, constr
from .base import BaseSchema

class StrategyParameters(BaseModel):
    gridSize: float = Field(..., description="Grid size for trading")
    gridSpacing: float = Field(..., description="Spacing between grid levels")
    maxPositions: int = Field(..., description="Maximum number of positions")
    stopLoss: float = Field(..., description="Stop loss percentage")
    takeProfit: float = Field(..., description="Take profit percentage")
    additionalParams: Optional[Dict[str, Any]] = Field(default=None, description="Additional strategy parameters")

class StrategyPerformance(BaseModel):
    totalProfit: float = Field(..., description="Total profit percentage")
    winRate: float = Field(..., description="Win rate percentage")
    totalTrades: int = Field(..., description="Total number of trades")
    averageProfit: float = Field(..., description="Average profit per trade")
    maxDrawdown: float = Field(..., description="Maximum drawdown percentage")

class Strategy(BaseModel):
    id: str = Field(..., description="Strategy ID")
    name: str = Field(..., description="Strategy name")
    description: str = Field(..., description="Strategy description")
    type: str = Field(..., description="Strategy type (grid/martingale/custom)")
    status: str = Field(..., description="Strategy status (active/inactive)")
    parameters: StrategyParameters = Field(..., description="Strategy parameters")
    performance: StrategyPerformance = Field(..., description="Strategy performance metrics")
    lastUpdate: datetime = Field(..., description="Last update timestamp")

class StrategyBase(BaseSchema):
    """
    Базовая схема стратегии.
    """
    name: constr(min_length=1)
    description: Optional[str] = None
    type: constr(min_length=1)
    symbol: constr(min_length=1)
    is_active: bool = True

class StrategyCreate(StrategyBase):
    """
    Схема для создания стратегии.
    """
    exchange_id: int
    settings: Dict[str, Any]

class StrategyUpdate(BaseSchema):
    """
    Схема для обновления стратегии.
    """
    name: Optional[constr(min_length=1)] = None
    description: Optional[str] = None
    type: Optional[constr(min_length=1)] = None
    symbol: Optional[constr(min_length=1)] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None

class StrategyInDB(StrategyBase):
    """
    Схема стратегии в базе данных.
    """
    id: int
    user_id: int
    exchange_id: int
    settings: Dict[str, Any]
    performance: Optional[Dict[str, Any]] = None
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    status: str
    error: Optional[str] = None

class StrategyResponse(StrategyInDB):
    """
    Схема для ответа с данными стратегии.
    """
    pass

class StrategySettings(BaseSchema):
    """
    Схема для настроек стратегии.
    """
    settings: Dict[str, Any]

class StrategyAction(BaseSchema):
    """
    Схема для действий со стратегией.
    """
    action: str  # start, stop, pause, resume 