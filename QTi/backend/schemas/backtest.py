from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Trade(BaseModel):
    timestamp: datetime = Field(..., description="Trade timestamp")
    type: str = Field(..., description="Trade type (buy/sell)")
    price: float = Field(..., description="Trade price")
    size: float = Field(..., description="Trade size")
    profit: float = Field(..., description="Trade profit/loss percentage")

class BacktestConfig(BaseModel):
    symbol: str = Field(..., description="Trading symbol")
    timeframe: str = Field(..., description="Trading timeframe")
    start_date: datetime = Field(..., description="Start date for backtesting")
    end_date: datetime = Field(..., description="End date for backtesting")
    initial_balance: float = Field(..., description="Initial balance for backtesting")
    strategy: str = Field(..., description="Strategy to use for backtesting")
    parameters: dict = Field(default_factory=dict, description="Strategy parameters")

class BacktestResult(BaseModel):
    id: str = Field(..., description="Backtest result ID")
    config: BacktestConfig = Field(..., description="Backtest configuration")
    total_profit: float = Field(..., description="Total profit percentage")
    win_rate: float = Field(..., description="Win rate percentage")
    total_trades: int = Field(..., description="Total number of trades")
    average_profit: float = Field(..., description="Average profit per trade")
    max_drawdown: float = Field(..., description="Maximum drawdown percentage")
    sharpe_ratio: float = Field(..., description="Sharpe ratio")
    equity_curve: List[dict] = Field(..., description="Equity curve data points")
    trades: List[Trade] = Field(..., description="List of trades")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class BacktestHistory(BaseModel):
    id: str = Field(..., description="Backtest history ID")
    symbol: str = Field(..., description="Trading symbol")
    timeframe: str = Field(..., description="Trading timeframe")
    start_date: datetime = Field(..., description="Start date")
    end_date: datetime = Field(..., description="End date")
    total_profit: float = Field(..., description="Total profit percentage")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True

class BacktestBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    config: Dict[str, Any]

class BacktestCreate(BacktestBase):
    pass

class BacktestResponse(BacktestBase):
    id: int
    results: Dict[str, Any]
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BacktestResults(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    total_profit: float
    max_drawdown: float
    sharpe_ratio: float
    trades: List[Dict[str, Any]]
    equity_curve: List[Dict[str, Any]]
    monthly_returns: Dict[str, float]
    yearly_returns: Dict[str, float] 