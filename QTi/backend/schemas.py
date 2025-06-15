from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from .models import BotStatus, ExchangeType, StrategyType
from enum import Enum

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Bot schemas
class BotStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    PENDING = "pending"

class ExchangeType(str, Enum):
    BINANCE = "binance"
    BYBIT = "bybit"
    OKX = "okx"

class StrategyType(str, Enum):
    GRID = "grid"
    DCA = "dca"
    MARTINGALE = "martingale"
    CUSTOM = "custom"

class BotBase(BaseModel):
    name: str
    exchange: ExchangeType
    symbol: str
    strategy: StrategyType
    config: Dict[str, Any]

class BotCreate(BotBase):
    pass

class BotUpdate(BaseModel):
    name: Optional[str] = None
    exchange: Optional[ExchangeType] = None
    symbol: Optional[str] = None
    strategy: Optional[StrategyType] = None
    config: Optional[Dict[str, Any]] = None

class BotInDB(BotBase):
    id: int
    status: BotStatus
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class Bot(BotBase):
    id: int
    status: BotStatus
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class BotStatus(BaseModel):
    id: int
    name: str
    exchange: ExchangeType
    symbol: str
    strategy: StrategyType
    status: BotStatus
    pid: Optional[int] = None
    uptime: Optional[float] = None
    profit: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BotLog(BaseModel):
    timestamp: datetime
    level: str
    message: str

class BotStats(BaseModel):
    total_trades: int
    win_rate: float
    profit_loss: float
    sharpe_ratio: float
    max_drawdown: float
    current_balance: float
    initial_balance: float
    last_update: datetime

# Backtest schemas
class BacktestResultBase(BaseModel):
    start_date: datetime
    end_date: datetime
    initial_balance: float
    final_balance: float
    total_trades: int
    win_rate: float
    profit_factor: float
    max_drawdown: float
    sharpe_ratio: float
    parameters: Dict[str, Any]

class BacktestResultCreate(BacktestResultBase):
    bot_id: int

class BacktestResultInDB(BacktestResultBase):
    id: int
    bot_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BacktestResult(BacktestResultBase):
    id: int
    bot_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Optimization schemas
class OptimizationResultBase(BaseModel):
    best_parameters: Dict[str, Any]
    metrics: Dict[str, float]

class OptimizationResultCreate(OptimizationResultBase):
    bot_id: int

class OptimizationResultInDB(OptimizationResultBase):
    id: int
    bot_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OptimizationResult(OptimizationResultBase):
    id: int
    bot_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Server config schemas
class ServerConfigBase(BaseModel):
    name: str
    host: str
    port: int
    username: str
    password: Optional[str]
    is_active: bool = True

class ServerConfigCreate(ServerConfigBase):
    pass

class ServerConfigUpdate(ServerConfigBase):
    pass

class ServerConfigInDB(ServerConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ServerConfig(ServerConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# User settings schemas
class ThemeType(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"

class ChartTheme(str, Enum):
    LIGHT = "light"
    DARK = "dark"
    BLUE = "blue"
    GREEN = "green"
    RED = "red"

class NotificationType(str, Enum):
    BOT_STATUS = "bot_status"
    TRADE = "trade"
    ERROR = "error"
    SYSTEM = "system"

class ExchangeAPIKeys(BaseModel):
    api_key: str
    api_secret: str

class NotificationSettings(BaseModel):
    email_notifications: bool = False
    telegram_notifications: bool = False
    telegram_chat_id: Optional[str] = None
    notification_types: List[NotificationType] = [
        NotificationType.BOT_STATUS,
        NotificationType.ERROR
    ]

class ThemeSettings(BaseModel):
    theme: ThemeType = ThemeType.DARK
    chart_theme: ChartTheme = ChartTheme.DARK
    custom_colors: Dict[str, str] = Field(
        default_factory=lambda: {
            "primary": "#1A2B44",
            "secondary": "#00C4B4",
            "success": "#00C4B4",
            "error": "#FF5252",
            "warning": "#FFB74D",
            "info": "#64B5F6"
        }
    )

class UserSettingsBase(BaseModel):
    theme: ThemeType = ThemeType.DARK
    notifications: bool = True
    auto_refresh: bool = True
    refresh_interval: int = 30
    default_exchange: str = "binance"
    default_symbol: str = "BTCUSDT"
    email_notifications: bool = False
    telegram_notifications: bool = False
    telegram_chat_id: Optional[str] = None
    notification_types: List[NotificationType] = [
        NotificationType.BOT_STATUS,
        NotificationType.ERROR
    ]
    chart_theme: ChartTheme = ChartTheme.DARK
    custom_colors: Dict[str, str] = Field(
        default_factory=lambda: {
            "primary": "#1A2B44",
            "secondary": "#00C4B4",
            "success": "#00C4B4",
            "error": "#FF5252",
            "warning": "#FFB74D",
            "info": "#64B5F6"
        }
    )

class UserSettingsCreate(UserSettingsBase):
    user_id: int

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsInDB(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class UserSettings(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    binance_api_key: Optional[str] = None
    binance_api_secret: Optional[str] = None
    bybit_api_key: Optional[str] = None
    bybit_api_secret: Optional[str] = None
    okx_api_key: Optional[str] = None
    okx_api_secret: Optional[str] = None

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]

class BotStatusMessage(WebSocketMessage):
    type: str = "bot_status"
    data: Dict[str, Any]

class ErrorMessage(WebSocketMessage):
    type: str = "error"
    data: Dict[str, Any]

class SystemMessage(WebSocketMessage):
    type: str = "system"
    data: Dict[str, Any] 