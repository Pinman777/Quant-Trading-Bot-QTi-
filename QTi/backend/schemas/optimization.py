from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class OptimizationParameters(BaseModel):
    gridSize: List[float] = Field(..., description="Range for grid size [min, max]")
    gridSpacing: List[float] = Field(..., description="Range for grid spacing [min, max]")
    maxPositions: List[float] = Field(..., description="Range for max positions [min, max]")
    stopLoss: List[float] = Field(..., description="Range for stop loss [min, max]")
    takeProfit: List[float] = Field(..., description="Range for take profit [min, max]")

class OptimizationConfig(BaseModel):
    symbol: str = Field(..., description="Trading symbol")
    timeframe: str = Field(..., description="Trading timeframe")
    startDate: datetime = Field(..., description="Start date for optimization")
    endDate: datetime = Field(..., description="End date for optimization")
    initialBalance: float = Field(..., description="Initial balance for backtesting")
    parameters: OptimizationParameters = Field(..., description="Strategy parameters to optimize")
    optimizationMethod: str = Field(..., description="Optimization method (grid, genetic, bayesian)")
    populationSize: Optional[int] = Field(None, description="Population size for genetic algorithm")
    generations: Optional[int] = Field(None, description="Number of generations for genetic algorithm")
    gridSteps: Optional[int] = Field(None, description="Number of steps for grid search")

class Trade(BaseModel):
    time: datetime = Field(..., description="Trade timestamp")
    type: str = Field(..., description="Trade type (buy/sell)")
    price: float = Field(..., description="Trade price")
    size: float = Field(..., description="Trade size")
    profit: float = Field(..., description="Trade profit")

class OptimizationResult(BaseModel):
    id: str = Field(..., description="Result ID")
    symbol: str = Field(..., description="Trading symbol")
    timeframe: str = Field(..., description="Trading timeframe")
    startDate: datetime = Field(..., description="Start date")
    endDate: datetime = Field(..., description="End date")
    totalProfit: float = Field(..., description="Total profit")
    winRate: float = Field(..., description="Win rate")
    totalTrades: int = Field(..., description="Total number of trades")
    averageProfit: float = Field(..., description="Average profit per trade")
    maxDrawdown: float = Field(..., description="Maximum drawdown")
    sharpeRatio: float = Field(..., description="Sharpe ratio")
    equityCurve: List[Dict[str, Any]] = Field(..., description="Equity curve data")
    trades: List[Trade] = Field(..., description="List of trades")
    parameters: Dict[str, float] = Field(..., description="Optimized parameters")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")

class OptimizationStatus(BaseModel):
    id: str = Field(..., description="Optimization ID")
    status: str = Field(..., description="Current status (running/completed/failed)")
    progress: float = Field(..., description="Progress percentage")
    currentIteration: int = Field(..., description="Current iteration number")
    totalIterations: int = Field(..., description="Total number of iterations")
    bestResult: Optional[OptimizationResult] = Field(None, description="Best result so far")
    error: Optional[str] = Field(None, description="Error message if failed") 