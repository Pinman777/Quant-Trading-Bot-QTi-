from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from .config import settings
from .logger import db_logger

# Создание движка базы данных
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Генератор сессий базы данных.
    
    Yields:
        Session: Сессия базы данных
    """
    db = SessionLocal()
    try:
        db_logger.debug("Database session started")
        yield db
    except Exception as e:
        db_logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db_logger.debug("Database session closed")
        db.close()

def init_db() -> None:
    """
    Инициализация базы данных.
    Создает все таблицы, определенные в моделях.
    """
    try:
        db_logger.info("Initializing database...")
        Base.metadata.create_all(bind=engine)
        db_logger.info("Database initialized successfully")
    except Exception as e:
        db_logger.error(f"Database initialization error: {str(e)}")
        raise

def drop_db() -> None:
    """
    Удаление всех таблиц из базы данных.
    Используется только для тестирования.
    """
    if not settings.TEST_MODE:
        db_logger.warning("Attempt to drop database in non-test mode")
        return
    
    try:
        db_logger.info("Dropping database...")
        Base.metadata.drop_all(bind=engine)
        db_logger.info("Database dropped successfully")
    except Exception as e:
        db_logger.error(f"Database drop error: {str(e)}")
        raise 