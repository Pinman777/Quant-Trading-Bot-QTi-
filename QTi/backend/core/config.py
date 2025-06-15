from typing import Dict, Any, Optional, List, Union
import configparser
from pathlib import Path
import json
import logging
from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

    # Основные настройки
    APP_NAME: str = "QTi"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str
    API_V1_STR: str = "/api/v1"

    # Настройки CORS
    CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]

    # Настройки базы данных
    DATABASE_URL: str
    DATABASE_TEST_URL: Optional[str] = None

    # Настройки Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Настройки JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Настройки бирж
    BINANCE_API_KEY: Optional[str] = None
    BINANCE_API_SECRET: Optional[str] = None

    # Настройки логирования
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "logs/qti.log"

    # Настройки мониторинга
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090

    # Настройки кэширования
    CACHE_TYPE: str = "redis"
    CACHE_REDIS_HOST: str = "localhost"
    CACHE_REDIS_PORT: int = 6379
    CACHE_REDIS_DB: int = 1
    CACHE_DEFAULT_TIMEOUT: int = 300

    # Настройки безопасности
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    ENABLE_2FA: bool = False

    # Настройки уведомлений
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    ENABLE_EMAIL_NOTIFICATIONS: bool = False

    # Настройки бэкапов
    BACKUP_DIR: str = "backups"
    BACKUP_RETENTION_DAYS: int = 7
    ENABLE_AUTO_BACKUP: bool = False

    # Настройки тестирования
    TEST_MODE: bool = False
    TEST_USER_EMAIL: str = "test@example.com"
    TEST_USER_PASSWORD: str = "testpassword"

    class Config:
        case_sensitive = True
        env_file = ".env"

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