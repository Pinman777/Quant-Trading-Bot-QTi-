import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Optional

from .config import settings

def setup_logger(
    name: str,
    log_file: Optional[str] = None,
    level: Optional[str] = None,
    format: Optional[str] = None,
) -> logging.Logger:
    """
    Настройка логгера с указанными параметрами.
    
    Args:
        name: Имя логгера
        log_file: Путь к файлу лога (если None, используется настройка из конфига)
        level: Уровень логирования (если None, используется настройка из конфига)
        format: Формат лога (если None, используется настройка из конфига)
    
    Returns:
        logging.Logger: Настроенный логгер
    """
    logger = logging.getLogger(name)
    
    # Установка уровня логирования
    log_level = getattr(logging, (level or settings.LOG_LEVEL).upper())
    logger.setLevel(log_level)
    
    # Формат лога
    log_format = format or settings.LOG_FORMAT
    formatter = logging.Formatter(log_format)
    
    # Очистка существующих обработчиков
    logger.handlers.clear()
    
    # Добавление обработчика для вывода в консоль
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Добавление обработчика для записи в файл
    if log_file or settings.LOG_FILE:
        log_path = Path(log_file or settings.LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = RotatingFileHandler(
            log_path,
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

# Создание основного логгера приложения
logger = setup_logger("qti")

# Создание логгеров для различных компонентов
api_logger = setup_logger("qti.api")
db_logger = setup_logger("qti.db")
auth_logger = setup_logger("qti.auth")
exchange_logger = setup_logger("qti.exchange")
backtest_logger = setup_logger("qti.backtest")
websocket_logger = setup_logger("qti.websocket") 