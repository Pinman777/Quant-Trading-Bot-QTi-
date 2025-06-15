from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

class Position(BaseModel):
    side: Literal["long", "short", "none"]
    size: float
    entry_price: float
    current_price: float

class BotStatus(BaseModel):
    id: str
    name: str
    symbol: str
    status: Literal["running", "stopped", "error"]
    pnl: float
    position: Position
    last_update: datetime

class Trade(BaseModel):
    id: str
    bot_id: str
    symbol: str
    side: Literal["buy", "sell"]
    price: float
    size: float
    timestamp: datetime
    pnl: float

class BotConfig(BaseModel):
    name: str
    symbol: str
    timeframe: str
    strategy: str
    parameters: dict
    risk_management: dict
    enabled: bool = True

class Bot(BaseModel):
    id: str
    config: BotConfig
    status: BotStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BotCreate(BaseModel):
    config: BotConfig

class BotUpdate(BaseModel):
    config: Optional[BotConfig] = None
    enabled: Optional[bool] = None 