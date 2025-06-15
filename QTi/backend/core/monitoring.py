from typing import Dict, List, Optional
import time
from datetime import datetime, timedelta
import psutil
import requests
from prometheus_client import start_http_server, Counter, Gauge, Histogram
from sqlalchemy.orm import Session

from .config import settings
from .logger import logger
from ..crud import user as crud_user
from ..crud import exchange as crud_exchange
from ..crud import strategy as crud_strategy
from ..crud import trade as crud_trade

# Метрики Prometheus
REQUEST_COUNT = Counter(
    'qti_request_total',
    'Total number of requests',
    ['endpoint', 'method', 'status']
)

REQUEST_LATENCY = Histogram(
    'qti_request_latency_seconds',
    'Request latency in seconds',
    ['endpoint']
)

ACTIVE_USERS = Gauge(
    'qti_active_users',
    'Number of active users'
)

ACTIVE_EXCHANGES = Gauge(
    'qti_active_exchanges',
    'Number of active exchanges'
)

ACTIVE_STRATEGIES = Gauge(
    'qti_active_strategies',
    'Number of active strategies'
)

TRADE_COUNT = Counter(
    'qti_trade_total',
    'Total number of trades',
    ['exchange', 'symbol', 'side']
)

SYSTEM_CPU_USAGE = Gauge(
    'qti_system_cpu_usage',
    'System CPU usage percentage'
)

SYSTEM_MEMORY_USAGE = Gauge(
    'qti_system_memory_usage',
    'System memory usage percentage'
)

SYSTEM_DISK_USAGE = Gauge(
    'qti_system_disk_usage',
    'System disk usage percentage'
)

def start_monitoring_server():
    """
    Запускает сервер мониторинга Prometheus.
    """
    if settings.ENABLE_METRICS:
        try:
            start_http_server(settings.METRICS_PORT)
            logger.info(f"Prometheus metrics server started on port {settings.METRICS_PORT}")
        except Exception as e:
            logger.error(f"Failed to start Prometheus metrics server: {str(e)}")

def update_system_metrics():
    """
    Обновляет системные метрики.
    """
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        SYSTEM_CPU_USAGE.set(cpu_percent)
        
        # Memory usage
        memory = psutil.virtual_memory()
        SYSTEM_MEMORY_USAGE.set(memory.percent)
        
        # Disk usage
        disk = psutil.disk_usage('/')
        SYSTEM_DISK_USAGE.set(disk.percent)
    except Exception as e:
        logger.error(f"Failed to update system metrics: {str(e)}")

def update_application_metrics(db: Session):
    """
    Обновляет метрики приложения.
    """
    try:
        # Active users
        active_users = crud_user.user.count_active(db)
        ACTIVE_USERS.set(active_users)
        
        # Active exchanges
        active_exchanges = crud_exchange.exchange.count_active(db)
        ACTIVE_EXCHANGES.set(active_exchanges)
        
        # Active strategies
        active_strategies = crud_strategy.strategy.count_active(db)
        ACTIVE_STRATEGIES.set(active_strategies)
    except Exception as e:
        logger.error(f"Failed to update application metrics: {str(e)}")

def record_request(endpoint: str, method: str, status: int, latency: float):
    """
    Записывает метрики запроса.
    """
    REQUEST_COUNT.labels(endpoint=endpoint, method=method, status=status).inc()
    REQUEST_LATENCY.labels(endpoint=endpoint).observe(latency)

def record_trade(exchange: str, symbol: str, side: str):
    """
    Записывает метрики сделки.
    """
    TRADE_COUNT.labels(exchange=exchange, symbol=symbol, side=side).inc()

def check_exchange_health(exchange_id: str, api_key: str, api_secret: str) -> Dict:
    """
    Проверяет здоровье биржи.
    """
    try:
        from .exchange import get_exchange_client, get_exchange_balance
        
        # Создаем клиент биржи
        exchange = get_exchange_client(exchange_id, api_key, api_secret)
        
        # Проверяем подключение
        start_time = time.time()
        balance = get_exchange_balance(exchange)
        latency = time.time() - start_time
        
        return {
            'status': 'healthy',
            'latency': latency,
            'balance': balance
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_strategy_health(strategy_id: int, db: Session) -> Dict:
    """
    Проверяет здоровье стратегии.
    """
    try:
        strategy = crud_strategy.strategy.get(db, id=strategy_id)
        if not strategy:
            return {
                'status': 'unhealthy',
                'error': 'Strategy not found'
            }
        
        # Проверяем последнюю активность
        last_active = strategy.last_active
        if last_active and (datetime.utcnow() - last_active) > timedelta(minutes=5):
            return {
                'status': 'unhealthy',
                'error': 'Strategy inactive for more than 5 minutes'
            }
        
        return {
            'status': 'healthy',
            'last_active': last_active,
            'performance': strategy.performance
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_database_health(db: Session) -> Dict:
    """
    Проверяет здоровье базы данных.
    """
    try:
        start_time = time.time()
        db.execute("SELECT 1")
        latency = time.time() - start_time
        
        return {
            'status': 'healthy',
            'latency': latency
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_redis_health() -> Dict:
    """
    Проверяет здоровье Redis.
    """
    try:
        from .cache import redis_client
        
        start_time = time.time()
        redis_client.ping()
        latency = time.time() - start_time
        
        return {
            'status': 'healthy',
            'latency': latency
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }

def check_external_services() -> Dict:
    """
    Проверяет доступность внешних сервисов.
    """
    services = {
        'binance': 'https://api.binance.com/api/v3/ping',
        'coinmarketcap': 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
    }
    
    results = {}
    for service, url in services.items():
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            latency = time.time() - start_time
            
            results[service] = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'latency': latency,
                'status_code': response.status_code
            }
        except Exception as e:
            results[service] = {
                'status': 'unhealthy',
                'error': str(e)
            }
    
    return results

def get_system_health(db: Session) -> Dict:
    """
    Получает общее состояние здоровья системы.
    """
    return {
        'timestamp': datetime.utcnow().isoformat(),
        'system': {
            'cpu_usage': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent
        },
        'database': check_database_health(db),
        'redis': check_redis_health(),
        'external_services': check_external_services(),
        'metrics': {
            'active_users': ACTIVE_USERS._value.get(),
            'active_exchanges': ACTIVE_EXCHANGES._value.get(),
            'active_strategies': ACTIVE_STRATEGIES._value.get()
        }
    } 