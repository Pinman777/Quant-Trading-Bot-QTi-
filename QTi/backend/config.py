from pydantic_settings import BaseSettings
from typing import Optional, List, Dict, Any
import os
from pathlib import Path
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

class Settings(BaseSettings):
    # Основные настройки
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "QTi API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Настройки сервера
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Настройки безопасности
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Настройки базы данных
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qti.db")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "5"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "10"))
    
    # Настройки CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    # Настройки WebSocket
    WS_PING_INTERVAL: int = int(os.getenv("WS_PING_INTERVAL", "30"))
    WS_PING_TIMEOUT: int = int(os.getenv("WS_PING_TIMEOUT", "10"))
    
    # Настройки бирж
    BINANCE_API_KEY: Optional[str] = os.getenv("BINANCE_API_KEY")
    BINANCE_API_SECRET: Optional[str] = os.getenv("BINANCE_API_SECRET")
    BYBIT_API_KEY: Optional[str] = os.getenv("BYBIT_API_KEY")
    BYBIT_API_SECRET: Optional[str] = os.getenv("BYBIT_API_SECRET")
    OKX_API_KEY: Optional[str] = os.getenv("OKX_API_KEY")
    OKX_API_SECRET: Optional[str] = os.getenv("OKX_API_SECRET")
    
    # Настройки CoinMarketCap
    CMC_API_KEY: Optional[str] = os.getenv("CMC_API_KEY")
    CMC_CACHE_TTL: int = int(os.getenv("CMC_CACHE_TTL", "300"))  # 5 минут
    
    # Настройки логирования
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")
    
    # Настройки ботов
    BOT_CONFIG_DIR: str = "./config/bots"
    BOT_LOG_DIR: str = "./logs/bots"
    BOT_DATA_DIR: str = os.getenv("BOT_DATA_DIR", "./data")
    
    # Настройки бэктестинга
    BACKTEST_DATA_DIR: str = os.getenv("BACKTEST_DATA_DIR", "./backtest_data")
    BACKTEST_RESULTS_DIR: str = os.getenv("BACKTEST_RESULTS_DIR", "./backtest_results")
    
    # Настройки оптимизации
    OPTIMIZATION_MAX_WORKERS: int = int(os.getenv("OPTIMIZATION_MAX_WORKERS", "4"))
    OPTIMIZATION_TIMEOUT: int = int(os.getenv("OPTIMIZATION_TIMEOUT", "3600"))  # 1 час
    
    # Настройки удаленных серверов
    REMOTE_SERVERS: Dict[str, Dict[str, Any]] = {}
    
    # Путь к конфигурационному файлу rclone
    RCLONE_CONFIG_PATH: str = os.getenv("RCLONE_CONFIG_PATH", "./config/rclone.conf")
    
    # Настройки API
    api_prefix: str = "/api"
    api_version: str = "v1"
    
    # Настройки CORS
    cors_origins: list[str] = ["http://localhost:3000"]
    cors_methods: list[str] = ["*"]
    cors_headers: list[str] = ["*"]
    
    # Настройки кэширования
    CACHE_DIR: str = "./cache"
    CACHE_DURATION: dict = {
        "global": 300,  # 5 minutes
        "cryptocurrencies": 300,  # 5 minutes
        "details": 300,  # 5 minutes
        "quotes": 60,  # 1 minute
    }
    
    # Настройки серверов
    SERVER_CONFIG_DIR: str = "./config/servers"
    SERVER_LOG_DIR: str = "./logs/servers"
    
    # Alert Settings
    DEFAULT_POSITION_LIMIT_THRESHOLD: int = 10
    DEFAULT_ENABLED_EXCHANGES: list = ["binance", "bybit", "okx"]
    DEFAULT_ENABLED_SYMBOLS: list = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    DEFAULT_NOTIFICATION_CHANNELS: Dict[str, bool] = {
        "email": False,
        "telegram": False,
        "web": True
    }
    
    # Email Settings
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: Optional[int] = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    
    # Telegram Settings
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_CHAT_ID: Optional[str] = os.getenv("TELEGRAM_CHAT_ID")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Создаем необходимые директории
        for directory in [
            self.BOT_CONFIG_DIR,
            self.BOT_LOG_DIR,
            self.BOT_DATA_DIR,
            self.BACKTEST_DATA_DIR,
            self.BACKTEST_RESULTS_DIR,
            self.CACHE_DIR,
            self.SERVER_CONFIG_DIR,
            self.SERVER_LOG_DIR,
        ]:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 