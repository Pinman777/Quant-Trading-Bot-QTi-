from typing import Any, Optional, Union
import json
from datetime import datetime, timedelta
import redis
from sqlalchemy.orm import Session
from .config import settings
from .logger import logger

# Инициализация Redis клиента
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

def get_cache(key: str) -> Optional[Any]:
    """
    Получает значение из кэша.
    """
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        print(f"Ошибка при получении из кэша: {str(e)}")
        return None

def set_cache(
    key: str,
    value: Any,
    expire: Optional[int] = None
) -> bool:
    """
    Устанавливает значение в кэш.
    """
    try:
        if expire is None:
            expire = settings.CACHE_DEFAULT_TIMEOUT
        redis_client.setex(
            key,
            expire,
            json.dumps(value)
        )
        return True
    except Exception as e:
        print(f"Ошибка при установке в кэш: {str(e)}")
        return False

def delete_cache(key: str) -> bool:
    """
    Удаляет значение из кэша.
    """
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        print(f"Ошибка при удалении из кэша: {str(e)}")
        return False

def clear_cache(pattern: str = "*") -> bool:
    """
    Очищает кэш по шаблону.
    """
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception as e:
        print(f"Ошибка при очистке кэша: {str(e)}")
        return False

def cache_decorator(
    key_prefix: str,
    expire: Optional[int] = None,
    key_builder: Optional[callable] = None
):
    """
    Декоратор для кэширования результатов функций.
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Формируем ключ кэша
            if key_builder:
                cache_key = f"{key_prefix}:{key_builder(*args, **kwargs)}"
            else:
                cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Пытаемся получить значение из кэша
            cached_value = get_cache(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Если значения нет в кэше, выполняем функцию
            result = func(*args, **kwargs)
            
            # Сохраняем результат в кэш
            set_cache(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator

def cache_exchange_data(
    exchange_id: str,
    data_type: str,
    data: Any,
    expire: Optional[int] = None
) -> bool:
    """
    Кэширует данные биржи.
    """
    key = f"exchange:{exchange_id}:{data_type}"
    return set_cache(key, data, expire)

def get_cached_exchange_data(
    exchange_id: str,
    data_type: str
) -> Optional[Any]:
    """
    Получает кэшированные данные биржи.
    """
    key = f"exchange:{exchange_id}:{data_type}"
    return get_cache(key)

def cache_strategy_data(
    strategy_id: str,
    data_type: str,
    data: Any,
    expire: Optional[int] = None
) -> bool:
    """
    Кэширует данные стратегии.
    """
    key = f"strategy:{strategy_id}:{data_type}"
    return set_cache(key, data, expire)

def get_cached_strategy_data(
    strategy_id: str,
    data_type: str
) -> Optional[Any]:
    """
    Получает кэшированные данные стратегии.
    """
    key = f"strategy:{strategy_id}:{data_type}"
    return get_cache(key)

def cache_user_data(
    user_id: int,
    data_type: str,
    data: Any,
    expire: Optional[int] = None
) -> bool:
    """
    Кэширует данные пользователя.
    """
    key = f"user:{user_id}:{data_type}"
    return set_cache(key, data, expire)

def get_cached_user_data(
    user_id: int,
    data_type: str
) -> Optional[Any]:
    """
    Получает кэшированные данные пользователя.
    """
    key = f"user:{user_id}:{data_type}"
    return get_cache(key)

def cache_market_data(
    symbol: str,
    data_type: str,
    data: Any,
    expire: Optional[int] = None
) -> bool:
    """
    Кэширует рыночные данные.
    """
    key = f"market:{symbol}:{data_type}"
    return set_cache(key, data, expire)

def get_cached_market_data(
    symbol: str,
    data_type: str
) -> Optional[Any]:
    """
    Получает кэшированные рыночные данные.
    """
    key = f"market:{symbol}:{data_type}"
    return get_cache(key)

class RedisCache:
    """
    Класс для работы с Redis и кэшированием.
    """
    def __init__(self):
        self.redis_client = redis_client
        self.default_timeout = settings.CACHE_DEFAULT_TIMEOUT

    def get(self, key: str) -> Optional[Any]:
        """
        Получение значения из кэша.
        
        Args:
            key: Ключ для получения значения
            
        Returns:
            Any: Значение из кэша или None, если значение не найдено
        """
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting value from cache: {str(e)}")
            return None

    def set(
        self,
        key: str,
        value: Any,
        timeout: Optional[int] = None
    ) -> bool:
        """
        Сохранение значения в кэш.
        
        Args:
            key: Ключ для сохранения
            value: Значение для сохранения
            timeout: Время жизни в секундах (если None, используется значение по умолчанию)
            
        Returns:
            bool: True если значение успешно сохранено, False в противном случае
        """
        try:
            timeout = timeout or self.default_timeout
            return self.redis_client.setex(
                key,
                timeout,
                json.dumps(value)
            )
        except Exception as e:
            logger.error(f"Error setting value in cache: {str(e)}")
            return False

    def delete(self, key: str) -> bool:
        """
        Удаление значения из кэша.
        
        Args:
            key: Ключ для удаления
            
        Returns:
            bool: True если значение успешно удалено, False в противном случае
        """
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting value from cache: {str(e)}")
            return False

    def exists(self, key: str) -> bool:
        """
        Проверка существования ключа в кэше.
        
        Args:
            key: Ключ для проверки
            
        Returns:
            bool: True если ключ существует, False в противном случае
        """
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking key existence in cache: {str(e)}")
            return False

    def ttl(self, key: str) -> int:
        """
        Получение оставшегося времени жизни ключа.
        
        Args:
            key: Ключ для проверки
            
        Returns:
            int: Оставшееся время жизни в секундах, -1 если ключ не имеет TTL, -2 если ключ не существует
        """
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL from cache: {str(e)}")
            return -2

    def clear(self) -> bool:
        """
        Очистка всего кэша.
        
        Returns:
            bool: True если кэш успешно очищен, False в противном случае
        """
        try:
            return bool(self.redis_client.flushdb())
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return False

# Создание экземпляра кэша
cache = RedisCache() 