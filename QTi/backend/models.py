from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from .database import Base
from .schemas.optimize import OptimizationStatus, OptimizationType

Base = declarative_base()

# Enums
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

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bots = relationship("Bot", back_populates="owner")
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    servers = relationship("Server", back_populates="owner")

class Bot(Base):
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, unique=True, index=True)
    exchange = Column(SQLEnum(ExchangeType))
    symbol = Column(String)
    strategy = Column(SQLEnum(StrategyType))
    config_path = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bots")
    backtests = relationship("Backtest", back_populates="bot")
    optimizations = relationship("Optimization", back_populates="bot")
    stats = relationship("BotStats", back_populates="bot")

class BotStats(Base):
    __tablename__ = "bot_stats"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    pnl = Column(Float)
    balance = Column(Float)
    position = Column(Float)
    price = Column(Float)
    volume = Column(Float)
    
    # Relationships
    bot = relationship("Bot", back_populates="stats")

class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)
    rclone_config = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="servers")

class BacktestResult(Base):
    __tablename__ = "backtest_results"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    initial_balance = Column(Float)
    final_balance = Column(Float)
    total_trades = Column(Integer)
    win_rate = Column(Float)
    profit_factor = Column(Float)
    max_drawdown = Column(Float)
    sharpe_ratio = Column(Float)
    parameters = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bot = relationship("Bot", back_populates="backtests")

class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    best_parameters = Column(JSON)
    metrics = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bot = relationship("Bot", back_populates="optimizations")

class ServerConfig(Base):
    __tablename__ = "server_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(SQLEnum(ThemeType), default=ThemeType.DARK)
    notifications = Column(Boolean, default=True)
    auto_refresh = Column(Boolean, default=True)
    refresh_interval = Column(Integer, default=30)
    default_exchange = Column(String, default="binance")
    default_symbol = Column(String, default="BTCUSDT")
    
    # API Keys
    binance_api_key = Column(String, nullable=True)
    binance_api_secret = Column(String, nullable=True)
    bybit_api_key = Column(String, nullable=True)
    bybit_api_secret = Column(String, nullable=True)
    okx_api_key = Column(String, nullable=True)
    okx_api_secret = Column(String, nullable=True)
    
    # Notification settings
    email_notifications = Column(Boolean, default=False)
    telegram_notifications = Column(Boolean, default=False)
    telegram_chat_id = Column(String, nullable=True)
    notification_types = Column(JSON, default=lambda: ["bot_status", "error"])
    
    # Theme settings
    chart_theme = Column(SQLEnum(ChartTheme), default=ChartTheme.DARK)
    custom_colors = Column(JSON, default=lambda: {
        "primary": "#1A2B44",
        "secondary": "#00C4B4",
        "success": "#00C4B4",
        "error": "#FF5252",
        "warning": "#FFB74D",
        "info": "#64B5F6"
    })
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="settings")

# Pydantic Models
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

class BotBase(BaseModel):
    name: str
    exchange: ExchangeType
    symbol: str
    strategy: StrategyType
    parameters: Dict[str, Any]

class BotCreate(BotBase):
    pass

class BotUpdate(BotBase):
    status: Optional[BotStatus] = None

class BotInDB(BotBase):
    id: int
    status: BotStatus
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

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

class UserSettingsBase(BaseModel):
    theme: str = "dark"
    notifications_enabled: bool = True
    refresh_interval: int = 5
    default_exchange: Optional[ExchangeType]
    default_symbol: Optional[str]

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

class Backtest(Base):
    __tablename__ = "backtests"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    name = Column(String, index=True)
    config_path = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    exchange = Column(String)
    symbol = Column(String)
    status = Column(String)
    results = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bot = relationship("Bot", back_populates="backtests")

class Optimization(Base):
    __tablename__ = "optimizations"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"))
    name = Column(String, index=True)
    param_ranges = Column(JSON)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    exchange = Column(String)
    symbol = Column(String)
    optimization_type = Column(SQLEnum(OptimizationType))
    status = Column(SQLEnum(OptimizationStatus), default=OptimizationStatus.PENDING)
    results = Column(JSON)
    history = Column(JSON)
    stats = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bot = relationship("Bot", back_populates="optimizations") 