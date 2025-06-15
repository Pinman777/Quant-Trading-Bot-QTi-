import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from ..core.testing import (
    test_websocket_connection,
    test_token,
    test_exchange,
    test_strategy
)

def test_websocket_connection_basic(test_client: TestClient, test_token: str):
    """
    Тест базового WebSocket соединения.
    """
    test_websocket_connection(
        client=test_client,
        endpoint="/ws/",
        token=test_token
    )

def test_websocket_exchange_updates(test_client: TestClient, test_token: str, test_exchange: dict):
    """
    Тест получения обновлений от биржи через WebSocket.
    """
    with test_client.websocket_connect(
        f"/ws/exchange/{test_exchange['id']}",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as websocket:
        # Отправляем сообщение о подписке
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "exchange_id": test_exchange["id"]
        }))
        
        # Получаем подтверждение подписки
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Получаем обновление от биржи
        response = websocket.receive_text()
        data = json.loads(response)
        assert "type" in data
        assert "data" in data
        assert data["type"] == "exchange_update"

def test_websocket_strategy_updates(test_client: TestClient, test_token: str, test_strategy: dict):
    """
    Тест получения обновлений от стратегии через WebSocket.
    """
    with test_client.websocket_connect(
        f"/ws/strategy/{test_strategy['id']}",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as websocket:
        # Отправляем сообщение о подписке
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "strategy_id": test_strategy["id"]
        }))
        
        # Получаем подтверждение подписки
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Получаем обновление от стратегии
        response = websocket.receive_text()
        data = json.loads(response)
        assert "type" in data
        assert "data" in data
        assert data["type"] == "strategy_update"

def test_websocket_trade_updates(test_client: TestClient, test_token: str):
    """
    Тест получения обновлений о сделках через WebSocket.
    """
    with test_client.websocket_connect(
        "/ws/trades",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as websocket:
        # Отправляем сообщение о подписке
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "channel": "trades"
        }))
        
        # Получаем подтверждение подписки
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Получаем обновление о сделке
        response = websocket.receive_text()
        data = json.loads(response)
        assert "type" in data
        assert "data" in data
        assert data["type"] == "trade_update"

def test_websocket_multiple_subscriptions(test_client: TestClient, test_token: str, test_exchange: dict, test_strategy: dict):
    """
    Тест множественных подписок через WebSocket.
    """
    with test_client.websocket_connect(
        "/ws/",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as websocket:
        # Подписываемся на обновления биржи
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "exchange_id": test_exchange["id"]
        }))
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Подписываемся на обновления стратегии
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "strategy_id": test_strategy["id"]
        }))
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Получаем обновления
        for _ in range(2):
            response = websocket.receive_text()
            data = json.loads(response)
            assert "type" in data
            assert "data" in data
            assert data["type"] in ["exchange_update", "strategy_update"]

def test_websocket_unsubscribe(test_client: TestClient, test_token: str, test_exchange: dict):
    """
    Тест отписки от WebSocket обновлений.
    """
    with test_client.websocket_connect(
        f"/ws/exchange/{test_exchange['id']}",
        headers={"Authorization": f"Bearer {test_token}"}
    ) as websocket:
        # Подписываемся
        websocket.send_text(json.dumps({
            "type": "subscribe",
            "exchange_id": test_exchange["id"]
        }))
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "subscribed"
        
        # Отписываемся
        websocket.send_text(json.dumps({
            "type": "unsubscribe",
            "exchange_id": test_exchange["id"]
        }))
        response = websocket.receive_text()
        assert json.loads(response)["status"] == "unsubscribed" 