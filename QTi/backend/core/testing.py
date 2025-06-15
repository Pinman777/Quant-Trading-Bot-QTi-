from typing import Dict, List, Optional
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from .config import settings
from .logger import logger
from ..crud import user as crud_user
from ..crud import exchange as crud_exchange
from ..crud import strategy as crud_strategy
from ..crud import trade as crud_trade
from ..schemas.user import UserCreate
from ..schemas.exchange import ExchangeCreate
from ..schemas.strategy import StrategyCreate
from ..schemas.trade import TradeCreate

def create_test_user(db: Session) -> Dict:
    """
    Создает тестового пользователя.
    """
    user_in = UserCreate(
        email=settings.TEST_USER_EMAIL,
        password=settings.TEST_USER_PASSWORD,
        username="test_user",
        is_active=True,
        is_superuser=False
    )
    user = crud_user.user.create(db, obj_in=user_in)
    return user

def create_test_exchange(db: Session, user_id: int) -> Dict:
    """
    Создает тестовую биржу.
    """
    exchange_in = ExchangeCreate(
        name="Test Exchange",
        exchange_id="binance",
        api_key="test_api_key",
        api_secret="test_api_secret",
        is_active=True,
        user_id=user_id
    )
    exchange = crud_exchange.exchange.create(db, obj_in=exchange_in)
    return exchange

def create_test_strategy(db: Session, user_id: int, exchange_id: int) -> Dict:
    """
    Создает тестовую стратегию.
    """
    strategy_in = StrategyCreate(
        name="Test Strategy",
        description="Test strategy description",
        exchange_id=exchange_id,
        user_id=user_id,
        parameters={
            "use_sma_crossover": True,
            "sma_short_period": 20,
            "sma_long_period": 50
        },
        is_active=True
    )
    strategy = crud_strategy.strategy.create(db, obj_in=strategy_in)
    return strategy

def create_test_trade(db: Session, user_id: int, exchange_id: int, strategy_id: int) -> Dict:
    """
    Создает тестовую сделку.
    """
    trade_in = TradeCreate(
        symbol="BTC/USDT",
        type="limit",
        side="buy",
        price=50000.0,
        amount=0.1,
        status="filled",
        exchange_id=exchange_id,
        strategy_id=strategy_id,
        user_id=user_id
    )
    trade = crud_trade.trade.create(db, obj_in=trade_in)
    return trade

def get_test_token(client: TestClient) -> str:
    """
    Получает тестовый токен доступа.
    """
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": settings.TEST_USER_EMAIL,
            "password": settings.TEST_USER_PASSWORD
        }
    )
    return response.json()["access_token"]

def setup_test_environment(db: Session) -> Dict:
    """
    Настраивает тестовое окружение.
    """
    # Создаем тестового пользователя
    user = create_test_user(db)
    
    # Создаем тестовую биржу
    exchange = create_test_exchange(db, user.id)
    
    # Создаем тестовую стратегию
    strategy = create_test_strategy(db, user.id, exchange.id)
    
    # Создаем тестовую сделку
    trade = create_test_trade(db, user.id, exchange.id, strategy.id)
    
    return {
        "user": user,
        "exchange": exchange,
        "strategy": strategy,
        "trade": trade
    }

def cleanup_test_environment(db: Session):
    """
    Очищает тестовое окружение.
    """
    # Удаляем все тестовые данные
    crud_trade.trade.remove_multi(db, user_id=settings.TEST_USER_ID)
    crud_strategy.strategy.remove_multi(db, user_id=settings.TEST_USER_ID)
    crud_exchange.exchange.remove_multi(db, user_id=settings.TEST_USER_ID)
    crud_user.user.remove(db, id=settings.TEST_USER_ID)

@pytest.fixture
def test_db(db: Session):
    """
    Фикстура для тестовой базы данных.
    """
    yield db
    cleanup_test_environment(db)

@pytest.fixture
def test_client(client: TestClient):
    """
    Фикстура для тестового клиента.
    """
    return client

@pytest.fixture
def test_user(test_db: Session):
    """
    Фикстура для тестового пользователя.
    """
    return create_test_user(test_db)

@pytest.fixture
def test_exchange(test_db: Session, test_user: Dict):
    """
    Фикстура для тестовой биржи.
    """
    return create_test_exchange(test_db, test_user["id"])

@pytest.fixture
def test_strategy(test_db: Session, test_user: Dict, test_exchange: Dict):
    """
    Фикстура для тестовой стратегии.
    """
    return create_test_strategy(test_db, test_user["id"], test_exchange["id"])

@pytest.fixture
def test_trade(test_db: Session, test_user: Dict, test_exchange: Dict, test_strategy: Dict):
    """
    Фикстура для тестовой сделки.
    """
    return create_test_trade(test_db, test_user["id"], test_exchange["id"], test_strategy["id"])

@pytest.fixture
def test_token(test_client: TestClient):
    """
    Фикстура для тестового токена.
    """
    return get_test_token(test_client)

def test_api_endpoint(
    client: TestClient,
    endpoint: str,
    method: str = "GET",
    data: Optional[Dict] = None,
    token: Optional[str] = None,
    expected_status: int = 200
) -> Dict:
    """
    Тестирует API эндпоинт.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    if method == "GET":
        response = client.get(endpoint, headers=headers)
    elif method == "POST":
        response = client.post(endpoint, json=data, headers=headers)
    elif method == "PUT":
        response = client.put(endpoint, json=data, headers=headers)
    elif method == "DELETE":
        response = client.delete(endpoint, headers=headers)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    assert response.status_code == expected_status
    return response.json()

def test_websocket_connection(
    client: TestClient,
    endpoint: str,
    token: Optional[str] = None
) -> None:
    """
    Тестирует WebSocket соединение.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    with client.websocket_connect(endpoint, headers=headers) as websocket:
        # Отправляем тестовое сообщение
        websocket.send_text(json.dumps({
            "type": "test",
            "message": "Hello, WebSocket!"
        }))
        
        # Получаем ответ
        response = websocket.receive_text()
        assert response is not None

def test_backup_restore(
    db: Session,
    backup_path: str
) -> None:
    """
    Тестирует создание и восстановление бэкапа.
    """
    from .backup import create_backup, restore_from_backup
    
    # Создаем тестовые данные
    test_data = setup_test_environment(db)
    
    # Создаем бэкап
    backup_file = create_backup()
    assert backup_file is not None
    
    # Очищаем базу данных
    cleanup_test_environment(db)
    
    # Восстанавливаем из бэкапа
    assert restore_from_backup(backup_file, db)
    
    # Проверяем восстановленные данные
    user = crud_user.user.get_by_email(db, email=settings.TEST_USER_EMAIL)
    assert user is not None
    
    exchange = crud_exchange.exchange.get_by_name(db, name="Test Exchange")
    assert exchange is not None
    
    strategy = crud_strategy.strategy.get_by_name(db, name="Test Strategy")
    assert strategy is not None
    
    trade = crud_trade.trade.get_by_symbol(db, symbol="BTC/USDT")
    assert trade is not None 