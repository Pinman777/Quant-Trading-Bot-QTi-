from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

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

class StrategyCreate(BaseModel):
    name: str = Field(..., description="Strategy name")
    description: str = Field(..., description="Strategy description")
    type: str = Field(..., description="Strategy type (grid/martingale/custom)")
    parameters: StrategyParameters = Field(..., description="Strategy parameters")

class StrategyUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Strategy name")
    description: Optional[str] = Field(None, description="Strategy description")
    type: Optional[str] = Field(None, description="Strategy type (grid/martingale/custom)")
    parameters: Optional[StrategyParameters] = Field(None, description="Strategy parameters") 