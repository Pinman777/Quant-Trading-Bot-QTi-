from typing import Dict, Any, Optional
import configparser
from pathlib import Path
import json
import logging
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

class Settings(BaseSettings):
    # Основные настройки
    PROJECT_NAME: str = "Quant Trading Bot (QTi)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Настройки безопасности
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # Настройки базы данных
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qti.db")
    
    # Настройки CoinMarketCap
    CMC_API_KEY: Optional[str] = os.getenv("CMC_API_KEY")
    CMC_API_URL: str = "https://pro-api.coinmarketcap.com/v1"
    CMC_CACHE_EXPIRE: int = 300  # 5 минут
    
    # Настройки Redis для кэширования
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Настройки бирж
    SUPPORTED_EXCHANGES: list = ["binance", "bybit", "okx"]
    
    # Настройки бэктестинга
    BACKTEST_MAX_WORKERS: int = 4
    BACKTEST_TIMEOUT: int = 3600  # 1 час
    
    # Настройки логирования
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        case_sensitive = True

settings = Settings()

class ConfigManager:
    def __init__(self, config_path: str = "qti.ini"):
        self.config_path = Path(config_path)
        self.config = configparser.ConfigParser()
        self.load_config()

    def load_config(self) -> None:
        """
        Загрузить конфигурацию из файла
        """
        try:
            if not self.config_path.exists():
                # Создаем файл с настройками по умолчанию
                self.create_default_config()
            else:
                self.config.read(self.config_path)
        except Exception as e:
            logger.error(f"Ошибка при загрузке конфигурации: {str(e)}")
            raise

    def create_default_config(self) -> None:
        """
        Создать конфигурацию по умолчанию
        """
        self.config["general"] = {
            "debug": "false",
            "log_level": "INFO",
            "theme": "dark"
        }

        self.config["api"] = {
            "host": "0.0.0.0",
            "port": "8000",
            "secret_key": "your-secret-key-here",
            "token_expire_minutes": "1440"
        }

        self.config["database"] = {
            "path": "data/qti.db",
            "backup_path": "data/backups"
        }

        self.config["coinmarketcap"] = {
            "api_key": "your-api-key-here",
            "cache_timeout": "300"
        }

        self.config["rclone"] = {
            "config_path": "~/.config/rclone/rclone.conf",
            "remote_name": "qti_remote"
        }

        self.config["passivbot"] = {
            "path": "./qti-bot",
            "python_path": "python3.12",
            "rust_path": "./qti-bot/passivbot_rust"
        }

        self.config["websocket"] = {
            "host": "0.0.0.0",
            "port": "8001"
        }

        self.save_config()

    def save_config(self) -> None:
        """
        Сохранить конфигурацию в файл
        """
        try:
            with open(self.config_path, "w") as f:
                self.config.write(f)
        except Exception as e:
            logger.error(f"Ошибка при сохранении конфигурации: {str(e)}")
            raise

    def get_value(self, section: str, key: str, default: Any = None) -> Any:
        """
        Получить значение из конфигурации
        """
        try:
            return self.config.get(section, key, fallback=default)
        except Exception as e:
            logger.error(f"Ошибка при получении значения {section}.{key}: {str(e)}")
            return default

    def set_value(self, section: str, key: str, value: Any) -> None:
        """
        Установить значение в конфигурации
        """
        try:
            if not self.config.has_section(section):
                self.config.add_section(section)
            self.config.set(section, key, str(value))
            self.save_config()
        except Exception as e:
            logger.error(f"Ошибка при установке значения {section}.{key}: {str(e)}")
            raise

    def get_section(self, section: str) -> Dict[str, str]:
        """
        Получить все значения из секции
        """
        try:
            if not self.config.has_section(section):
                return {}
            return dict(self.config[section])
        except Exception as e:
            logger.error(f"Ошибка при получении секции {section}: {str(e)}")
            return {} 