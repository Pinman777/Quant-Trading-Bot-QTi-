import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ..core.testing import (
    test_api_endpoint,
    test_user,
    test_exchange,
    test_strategy,
    test_trade,
    test_token
)

def test_login(test_client: TestClient):
    """
    Тест авторизации пользователя.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/auth/login",
        method="POST",
        data={
            "username": "test@example.com",
            "password": "testpassword"
        }
    )
    assert "access_token" in response
    assert "token_type" in response
    assert response["token_type"] == "bearer"

def test_get_current_user(test_client: TestClient, test_token: str):
    """
    Тест получения информации о текущем пользователе.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/users/me",
        method="GET",
        token=test_token
    )
    assert response["email"] == "test@example.com"
    assert response["username"] == "test_user"

def test_create_exchange(test_client: TestClient, test_token: str):
    """
    Тест создания новой биржи.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/exchanges/",
        method="POST",
        token=test_token,
        data={
            "name": "Test Exchange 2",
            "exchange_id": "binance",
            "api_key": "test_api_key_2",
            "api_secret": "test_api_secret_2",
            "is_active": True
        }
    )
    assert response["name"] == "Test Exchange 2"
    assert response["exchange_id"] == "binance"

def test_get_exchanges(test_client: TestClient, test_token: str):
    """
    Тест получения списка бирж.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/exchanges/",
        method="GET",
        token=test_token
    )
    assert isinstance(response, list)
    assert len(response) > 0

def test_create_strategy(test_client: TestClient, test_token: str, test_exchange: dict):
    """
    Тест создания новой стратегии.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/strategies/",
        method="POST",
        token=test_token,
        data={
            "name": "Test Strategy 2",
            "description": "Test strategy description 2",
            "exchange_id": test_exchange["id"],
            "parameters": {
                "use_sma_crossover": True,
                "sma_short_period": 20,
                "sma_long_period": 50
            },
            "is_active": True
        }
    )
    assert response["name"] == "Test Strategy 2"
    assert response["exchange_id"] == test_exchange["id"]

def test_get_strategies(test_client: TestClient, test_token: str):
    """
    Тест получения списка стратегий.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/strategies/",
        method="GET",
        token=test_token
    )
    assert isinstance(response, list)
    assert len(response) > 0

def test_create_trade(test_client: TestClient, test_token: str, test_exchange: dict, test_strategy: dict):
    """
    Тест создания новой сделки.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/trades/",
        method="POST",
        token=test_token,
        data={
            "symbol": "ETH/USDT",
            "type": "limit",
            "side": "buy",
            "price": 3000.0,
            "amount": 1.0,
            "status": "filled",
            "exchange_id": test_exchange["id"],
            "strategy_id": test_strategy["id"]
        }
    )
    assert response["symbol"] == "ETH/USDT"
    assert response["exchange_id"] == test_exchange["id"]
    assert response["strategy_id"] == test_strategy["id"]

def test_get_trades(test_client: TestClient, test_token: str):
    """
    Тест получения списка сделок.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/trades/",
        method="GET",
        token=test_token
    )
    assert isinstance(response, list)
    assert len(response) > 0

def test_get_trade_statistics(test_client: TestClient, test_token: str):
    """
    Тест получения статистики по сделкам.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint="/api/v1/trades/statistics",
        method="GET",
        token=test_token
    )
    assert "total_trades" in response
    assert "winning_trades" in response
    assert "losing_trades" in response
    assert "total_profit" in response
    assert "win_rate" in response

def test_update_exchange(test_client: TestClient, test_token: str, test_exchange: dict):
    """
    Тест обновления биржи.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint=f"/api/v1/exchanges/{test_exchange['id']}",
        method="PUT",
        token=test_token,
        data={
            "name": "Updated Exchange",
            "is_active": False
        }
    )
    assert response["name"] == "Updated Exchange"
    assert response["is_active"] is False

def test_update_strategy(test_client: TestClient, test_token: str, test_strategy: dict):
    """
    Тест обновления стратегии.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint=f"/api/v1/strategies/{test_strategy['id']}",
        method="PUT",
        token=test_token,
        data={
            "name": "Updated Strategy",
            "is_active": False
        }
    )
    assert response["name"] == "Updated Strategy"
    assert response["is_active"] is False

def test_delete_exchange(test_client: TestClient, test_token: str, test_exchange: dict):
    """
    Тест удаления биржи.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint=f"/api/v1/exchanges/{test_exchange['id']}",
        method="DELETE",
        token=test_token
    )
    assert response["status"] == "success"

def test_delete_strategy(test_client: TestClient, test_token: str, test_strategy: dict):
    """
    Тест удаления стратегии.
    """
    response = test_api_endpoint(
        client=test_client,
        endpoint=f"/api/v1/strategies/{test_strategy['id']}",
        method="DELETE",
        token=test_token
    )
    assert response["status"] == "success" 