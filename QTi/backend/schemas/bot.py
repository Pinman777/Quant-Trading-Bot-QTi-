from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class BotConfig(BaseModel):
    gridSize: float = Field(..., description="Grid size for trading")
    gridSpacing: float = Field(..., description="Spacing between grid levels")
    maxPositions: int = Field(..., description="Maximum number of positions")
    stopLoss: float = Field(..., description="Stop loss percentage")
    takeProfit: float = Field(..., description="Take profit percentage")

class BotBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    exchange: str = Field(..., min_length=1, max_length=50)
    symbol: str = Field(..., min_length=1, max_length=20)
    config: Dict[str, Any]

class BotCreate(BotBase):
    pass

class BotUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    exchange: Optional[str] = Field(None, min_length=1, max_length=50)
    symbol: Optional[str] = Field(None, min_length=1, max_length=20)
    config: Optional[Dict[str, Any]] = None

class BotResponse(BotBase):
    id: int
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BotStatsBase(BaseModel):
    pnl: float
    balance: float
    position: float
    price: float
    volume: float

class BotStatsCreate(BotStatsBase):
    bot_id: int

class BotStatsResponse(BotStatsBase):
    id: int
    bot_id: int
    timestamp: datetime

    class Config:
        from_attributes = True 