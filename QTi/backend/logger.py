import logging
import logging.handlers
import os
import json
from datetime import datetime
from typing import Dict, Any

# Создаем директорию для логов, если она не существует
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

class StructuredLogFormatter(logging.Formatter):
    """Форматтер для структурированного логирования в JSON"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Форматирование записи лога в JSON
        
        Args:
            record: Запись лога
            
        Returns:
            str: JSON строка с данными лога
        """
        # Базовые поля лога
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Добавляем дополнительные поля из extra
        if hasattr(record, "extra"):
            log_data.update(record.extra)
            
        # Добавляем информацию об исключении, если есть
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
            
        return json.dumps(log_data)

def setup_logger(
    name: str,
    level: str = "INFO",
    log_file: str = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB
    backup_count: int = 5,
    rotation: str = "midnight"
) -> logging.Logger:
    """Настройка логгера
    
    Args:
        name: Имя логгера
        level: Уровень логирования
        log_file: Путь к файлу лога
        max_bytes: Максимальный размер файла лога
        backup_count: Количество файлов для ротации
        rotation: Тип ротации (midnight, time, size)
        
    Returns:
        logging.Logger: Настроенный логгер
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Форматтер для структурированного логирования
    formatter = StructuredLogFormatter()
    
    # Хендлер для консоли
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Хендлер для файла, если указан
    if log_file:
        log_path = os.path.join(LOG_DIR, log_file)
        
        if rotation == "midnight":
            file_handler = logging.handlers.TimedRotatingFileHandler(
                log_path,
                when="midnight",
                interval=1,
                backupCount=backup_count
            )
        elif rotation == "time":
            file_handler = logging.handlers.TimedRotatingFileHandler(
                log_path,
                when="H",
                interval=1,
                backupCount=backup_count
            )
        else:  # size
            file_handler = logging.handlers.RotatingFileHandler(
                log_path,
                maxBytes=max_bytes,
                backupCount=backup_count
            )
            
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
    return logger

def log_extra(data: Dict[str, Any]) -> Dict[str, Any]:
    """Создание словаря с дополнительными данными для лога
    
    Args:
        data: Словарь с дополнительными данными
        
    Returns:
        Dict[str, Any]: Словарь с дополнительными данными
    """
    return data

# Создаем логгеры для разных компонентов системы
server_logger = setup_logger(
    "server",
    level="INFO",
    log_file="server.log",
    rotation="midnight"
)

api_logger = setup_logger(
    "api",
    level="INFO",
    log_file="api.log",
    rotation="midnight"
)

bot_logger = setup_logger(
    "bot",
    level="DEBUG",
    log_file="bot.log",
    rotation="size"
)

market_logger = setup_logger(
    "market",
    level="INFO",
    log_file="market.log",
    rotation="time"
)

websocket_logger = setup_logger(
    "websocket",
    level="DEBUG",
    log_file="websocket.log",
    rotation="size"
)

database_logger = setup_logger(
    "database",
    level="INFO",
    log_file="database.log",
    rotation="midnight"
)

cache_logger = setup_logger(
    "cache",
    level="INFO",
    log_file="cache.log",
    rotation="midnight"
)

backtest_logger = setup_logger(
    "backtest",
    level="DEBUG",
    log_file="backtest.log",
    rotation="size"
)

optimization_logger = setup_logger(
    "optimization",
    level="DEBUG",
    log_file="optimization.log",
    rotation="size"
) 