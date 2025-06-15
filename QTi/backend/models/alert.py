from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)  # position_limit, balance, order, system
    exchange = Column(String, index=True)
    symbol = Column(String, index=True)
    message = Column(String)
    severity = Column(String)  # info, warning, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False)

class AlertSettings(Base):
    __tablename__ = "alert_settings"

    id = Column(Integer, primary_key=True, index=True)
    position_limit_threshold = Column(Integer, default=10)  # Процент от баланса
    enabled_exchanges = Column(JSON, default=list)  # Список включенных бирж
    enabled_symbols = Column(JSON, default=list)  # Список включенных символов
    notification_channels = Column(JSON, default=dict)  # Настройки каналов уведомлений 