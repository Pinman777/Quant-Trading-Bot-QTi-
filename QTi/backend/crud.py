from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_
from typing import List, Optional, Dict, Any
from datetime import datetime
from . import models, schemas
from .models import User, Bot, BacktestResult, OptimizationResult, ServerConfig, UserSettings
from .schemas import (
    UserCreate, UserUpdate, BotCreate, BotUpdate,
    BacktestResultCreate, OptimizationResultCreate,
    ServerConfigCreate, ServerConfigUpdate,
    UserSettingsCreate, UserSettingsUpdate
)
from .schemas.optimize import OptimizationStatus

# User operations
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = "hashed_" + user.password  # TODO: Implement proper password hashing
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_active=user.is_active
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserUpdate) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = "hashed_" + update_data.pop("password")
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Bot operations
def get_bot(db: Session, bot_id: int) -> Optional[Bot]:
    return db.query(Bot).filter(Bot.id == bot_id).first()

def get_bots(db: Session, skip: int = 0, limit: int = 100) -> List[Bot]:
    return db.query(Bot).offset(skip).limit(limit).all()

def get_user_bots(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Bot]:
    return db.query(Bot).filter(Bot.owner_id == user_id).offset(skip).limit(limit).all()

def create_bot(db: Session, bot: BotCreate, user_id: int) -> Bot:
    db_bot = Bot(
        **bot.dict(),
        owner_id=user_id
    )
    db.add(db_bot)
    db.commit()
    db.refresh(db_bot)
    return db_bot

def update_bot(db: Session, bot_id: int, bot: BotUpdate) -> Optional[Bot]:
    db_bot = get_bot(db, bot_id)
    if not db_bot:
        return None
    
    update_data = bot.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bot, key, value)
    
    db.commit()
    db.refresh(db_bot)
    return db_bot

def delete_bot(db: Session, bot_id: int) -> bool:
    db_bot = get_bot(db, bot_id)
    if not db_bot:
        return False
    
    db.delete(db_bot)
    db.commit()
    return True

# Backtest operations
def get_backtest(db: Session, backtest_id: int) -> Optional[BacktestResult]:
    return db.query(BacktestResult).filter(BacktestResult.id == backtest_id).first()

def get_bot_backtests(db: Session, bot_id: int, skip: int = 0, limit: int = 100) -> List[BacktestResult]:
    return db.query(BacktestResult).filter(BacktestResult.bot_id == bot_id).offset(skip).limit(limit).all()

def create_backtest(db: Session, backtest: BacktestResultCreate) -> BacktestResult:
    db_backtest = BacktestResult(**backtest.dict())
    db.add(db_backtest)
    db.commit()
    db.refresh(db_backtest)
    return db_backtest

# Optimization operations
async def get_optimizations(
    db: Session,
    bot_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Optimization]:
    """
    Получить список оптимизаций для бота
    """
    return db.query(models.Optimization)\
        .filter(models.Optimization.bot_id == bot_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

async def get_optimization(
    db: Session,
    optimization_id: int
) -> Optional[models.Optimization]:
    """
    Получить оптимизацию по ID
    """
    return db.query(models.Optimization)\
        .filter(models.Optimization.id == optimization_id)\
        .first()

async def create_optimization(
    db: Session,
    bot_id: int,
    optimization: schemas.OptimizationCreate
) -> models.Optimization:
    """
    Создать новую оптимизацию
    """
    db_optimization = models.Optimization(
        bot_id=bot_id,
        name=optimization.name,
        param_ranges=optimization.param_ranges,
        start_date=optimization.start_date,
        end_date=optimization.end_date,
        exchange=optimization.exchange,
        symbol=optimization.symbol,
        optimization_type=optimization.optimization_type,
        status=OptimizationStatus.PENDING
    )
    db.add(db_optimization)
    db.commit()
    db.refresh(db_optimization)
    return db_optimization

async def update_optimization_status(
    db: Session,
    optimization_id: int,
    status: OptimizationStatus
) -> Optional[models.Optimization]:
    """
    Обновить статус оптимизации
    """
    db_optimization = await get_optimization(db, optimization_id)
    if db_optimization:
        db_optimization.status = status
        db_optimization.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_optimization)
    return db_optimization

async def update_optimization_results(
    db: Session,
    optimization_id: int,
    results: Dict[str, Any],
    history: List[Dict[str, Any]],
    stats: Dict[str, Any]
) -> Optional[models.Optimization]:
    """
    Обновить результаты оптимизации
    """
    db_optimization = await get_optimization(db, optimization_id)
    if db_optimization:
        db_optimization.results = results
        db_optimization.history = history
        db_optimization.stats = stats
        db_optimization.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_optimization)
    return db_optimization

async def delete_optimization(
    db: Session,
    optimization_id: int
) -> Optional[models.Optimization]:
    """
    Удалить оптимизацию
    """
    db_optimization = await get_optimization(db, optimization_id)
    if db_optimization:
        db.delete(db_optimization)
        db.commit()
    return db_optimization

async def check_bot_ownership(
    db: Session,
    bot_id: int,
    user_id: int
) -> bool:
    """
    Проверить, принадлежит ли бот пользователю
    """
    bot = db.query(models.Bot)\
        .filter(and_(
            models.Bot.id == bot_id,
            models.Bot.owner_id == user_id
        ))\
        .first()
    return bot is not None

# Server config operations
def get_server_config(db: Session, config_id: int) -> Optional[ServerConfig]:
    return db.query(ServerConfig).filter(ServerConfig.id == config_id).first()

def get_server_configs(db: Session, skip: int = 0, limit: int = 100) -> List[ServerConfig]:
    return db.query(ServerConfig).offset(skip).limit(limit).all()

def create_server_config(db: Session, config: ServerConfigCreate) -> ServerConfig:
    db_config = ServerConfig(**config.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def update_server_config(db: Session, config_id: int, config: ServerConfigUpdate) -> Optional[ServerConfig]:
    db_config = get_server_config(db, config_id)
    if not db_config:
        return None
    
    update_data = config.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_config, key, value)
    
    db.commit()
    db.refresh(db_config)
    return db_config

def delete_server_config(db: Session, config_id: int) -> bool:
    db_config = get_server_config(db, config_id)
    if not db_config:
        return False
    
    db.delete(db_config)
    db.commit()
    return True

# User settings operations
def get_user_settings(db: Session, user_id: int) -> Optional[UserSettings]:
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

def create_user_settings(db: Session, settings: UserSettingsCreate) -> UserSettings:
    db_settings = UserSettings(**settings.dict())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_user_settings(db: Session, user_id: int, settings: UserSettingsUpdate) -> Optional[UserSettings]:
    db_settings = get_user_settings(db, user_id)
    if not db_settings:
        return None
    
    update_data = settings.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings 