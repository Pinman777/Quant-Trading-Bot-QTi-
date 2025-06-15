import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from ..logger import auth_logger, log_extra

class Auth:
    def __init__(self, config_path: str):
        """Инициализация сервиса аутентификации
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        auth_logger.info(
            "Сервис аутентификации инициализирован",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация аутентификации
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            auth_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            auth_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Проверка пароля
        
        Args:
            plain_password: Пароль в открытом виде
            hashed_password: Хеш пароля
            
        Returns:
            bool: True если пароль верный
        """
        try:
            result = self.pwd_context.verify(plain_password, hashed_password)
            
            auth_logger.debug(
                "Пароль проверен",
                extra=log_extra({
                    "result": result
                })
            )
            return result
            
        except Exception as e:
            auth_logger.error(
                "Ошибка проверки пароля",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    def get_password_hash(self, password: str) -> str:
        """Получение хеша пароля
        
        Args:
            password: Пароль в открытом виде
            
        Returns:
            str: Хеш пароля
        """
        try:
            hashed = self.pwd_context.hash(password)
            
            auth_logger.debug(
                "Хеш пароля получен"
            )
            return hashed
            
        except Exception as e:
            auth_logger.error(
                "Ошибка получения хеша пароля",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Создание токена доступа
        
        Args:
            data: Данные для токена
            expires_delta: Время жизни токена
            
        Returns:
            str: Токен доступа
        """
        try:
            to_encode = data.copy()
            
            if expires_delta:
                expire = datetime.utcnow() + expires_delta
            else:
                expire = datetime.utcnow() + timedelta(minutes=15)
                
            to_encode.update({"exp": expire})
            encoded_jwt = jwt.encode(to_encode, self.config["secret_key"], algorithm=self.config["algorithm"])
            
            auth_logger.info(
                "Токен доступа создан",
                extra=log_extra({
                    "data": data,
                    "expire": expire.isoformat()
                })
            )
            return encoded_jwt
            
        except Exception as e:
            auth_logger.error(
                "Ошибка создания токена доступа",
                exc_info=True,
                extra=log_extra({
                    "data": data,
                    "error": str(e)
                })
            )
            raise
            
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Проверка токена
        
        Args:
            token: Токен доступа
            
        Returns:
            Optional[Dict[str, Any]]: Данные токена или None
        """
        try:
            payload = jwt.decode(token, self.config["secret_key"], algorithms=[self.config["algorithm"]])
            
            auth_logger.debug(
                "Токен проверен",
                extra=log_extra({
                    "payload": payload
                })
            )
            return payload
            
        except JWTError as e:
            auth_logger.warning(
                "Ошибка проверки токена",
                extra=log_extra({
                    "error": str(e)
                })
            )
            return None
            
        except Exception as e:
            auth_logger.error(
                "Ошибка проверки токена",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise
            
    async def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Аутентификация пользователя
        
        Args:
            username: Имя пользователя
            password: Пароль
            
        Returns:
            Optional[Dict[str, Any]]: Данные пользователя или None
        """
        try:
            auth_logger.info(
                "Аутентификация пользователя",
                extra=log_extra({
                    "username": username
                })
            )
            
            # TODO: Реализовать аутентификацию пользователя
            
            user = {
                "username": username,
                "hashed_password": self.get_password_hash(password)
            }
            
            if not self.verify_password(password, user["hashed_password"]):
                auth_logger.warning(
                    "Неверный пароль",
                    extra=log_extra({
                        "username": username
                    })
                )
                return None
                
            auth_logger.info(
                "Пользователь аутентифицирован",
                extra=log_extra({
                    "username": username
                })
            )
            return user
            
        except Exception as e:
            auth_logger.error(
                "Ошибка аутентификации пользователя",
                exc_info=True,
                extra=log_extra({
                    "username": username,
                    "error": str(e)
                })
            )
            raise 