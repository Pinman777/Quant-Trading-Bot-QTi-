from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any
import jwt
from .config import settings
from .logger import logger

class Security:
    """
    Класс для работы с JWT токенами и безопасностью.
    """
    @staticmethod
    def create_access_token(
        subject: Union[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Создание JWT токена доступа.
        
        Args:
            subject: Данные для включения в токен
            expires_delta: Время жизни токена
            
        Returns:
            str: JWT токен
        """
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode = {
            "exp": expire,
            "sub": str(subject),
            "type": "access"
        }
        
        try:
            encoded_jwt = jwt.encode(
                to_encode,
                settings.JWT_SECRET_KEY,
                algorithm=settings.JWT_ALGORITHM
            )
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating access token: {str(e)}")
            raise

    @staticmethod
    def create_refresh_token(
        subject: Union[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Создание JWT токена обновления.
        
        Args:
            subject: Данные для включения в токен
            expires_delta: Время жизни токена
            
        Returns:
            str: JWT токен
        """
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )
        
        to_encode = {
            "exp": expire,
            "sub": str(subject),
            "type": "refresh"
        }
        
        try:
            encoded_jwt = jwt.encode(
                to_encode,
                settings.JWT_SECRET_KEY,
                algorithm=settings.JWT_ALGORITHM
            )
            return encoded_jwt
        except Exception as e:
            logger.error(f"Error creating refresh token: {str(e)}")
            raise

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Проверка JWT токена.
        
        Args:
            token: JWT токен для проверки
            
        Returns:
            Dict[str, Any]: Данные из токена
            
        Raises:
            jwt.InvalidTokenError: Если токен недействителен
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            raise
        except jwt.JWTError as e:
            logger.error(f"Invalid token: {str(e)}")
            raise

    @staticmethod
    def get_token_type(token: str) -> str:
        """
        Получение типа токена.
        
        Args:
            token: JWT токен
            
        Returns:
            str: Тип токена ('access' или 'refresh')
            
        Raises:
            ValueError: Если тип токена не определен
        """
        try:
            payload = Security.verify_token(token)
            token_type = payload.get("type")
            if not token_type:
                raise ValueError("Token type not found")
            return token_type
        except Exception as e:
            logger.error(f"Error getting token type: {str(e)}")
            raise

# Создание экземпляра для работы с безопасностью
security = Security() 