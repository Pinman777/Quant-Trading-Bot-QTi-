import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from ..main import app
from ..models.alert import Alert, AlertSettings

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch('QTi.backend.api.alerts.get_db') as mock:
        yield mock

@pytest.fixture
def mock_alert_service():
    with patch('QTi.backend.api.alerts.AlertService') as mock:
        yield mock

def test_get_alerts(mock_db, mock_alert_service):
    mock_alerts = [
        Alert(
            id=1,
            type="position_limit",
            exchange="binance",
            symbol="BTC/USDT",
            message="Test alert",
            severity="warning",
            read=False
        )
    ]
    mock_alert_service.return_value.get_alerts.return_value = mock_alerts

    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "position_limit"
    assert data[0]["exchange"] == "binance"

def test_get_unread_alerts(mock_db, mock_alert_service):
    mock_alerts = [
        Alert(
            id=1,
            type="position_limit",
            exchange="binance",
            symbol="BTC/USDT",
            message="Test alert",
            severity="warning",
            read=False
        )
    ]
    mock_alert_service.return_value.get_unread_alerts.return_value = mock_alerts

    response = client.get("/api/v1/alerts/unread")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["read"] == False

def test_create_alert(mock_db, mock_alert_service):
    mock_alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    mock_alert_service.return_value.create_alert.return_value = mock_alert

    response = client.post(
        "/api/v1/alerts",
        json={
            "type": "position_limit",
            "exchange": "binance",
            "symbol": "BTC/USDT",
            "message": "Test alert",
            "severity": "warning"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "position_limit"
    assert data["exchange"] == "binance"

def test_mark_alert_as_read(mock_db, mock_alert_service):
    mock_alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=True
    )
    mock_alert_service.return_value.mark_alert_as_read.return_value = mock_alert

    response = client.post("/api/v1/alerts/1/read")
    assert response.status_code == 200
    assert response.json()["message"] == "Alert marked as read"

def test_mark_all_alerts_as_read(mock_db, mock_alert_service):
    response = client.post("/api/v1/alerts/read-all")
    assert response.status_code == 200
    assert response.json()["message"] == "All alerts marked as read"

def test_delete_alert(mock_db, mock_alert_service):
    response = client.delete("/api/v1/alerts/1")
    assert response.status_code == 200
    assert response.json()["message"] == "Alert deleted"

def test_clear_all_alerts(mock_db, mock_alert_service):
    response = client.delete("/api/v1/alerts")
    assert response.status_code == 200
    assert response.json()["message"] == "All alerts cleared"

def test_get_alert_settings(mock_db, mock_alert_service):
    mock_settings = AlertSettings(
        id=1,
        position_limit_threshold=10,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": False,
            "telegram": False,
            "web": True
        }
    )
    mock_alert_service.return_value.get_alert_settings.return_value = mock_settings

    response = client.get("/api/v1/alerts/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["position_limit_threshold"] == 10
    assert data["enabled_exchanges"] == ["binance"]
    assert data["enabled_symbols"] == ["BTC/USDT"]
    assert data["notification_channels"]["web"] == True

def test_update_alert_settings(mock_db, mock_alert_service):
    mock_settings = AlertSettings(
        id=1,
        position_limit_threshold=20,
        enabled_exchanges=["binance", "bybit"],
        enabled_symbols=["BTC/USDT", "ETH/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )
    mock_alert_service.return_value.update_alert_settings.return_value = mock_settings

    response = client.put(
        "/api/v1/alerts/settings",
        json={
            "position_limit_threshold": 20,
            "enabled_exchanges": ["binance", "bybit"],
            "enabled_symbols": ["BTC/USDT", "ETH/USDT"],
            "notification_channels": {
                "email": True,
                "telegram": True,
                "web": True
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["position_limit_threshold"] == 20
    assert data["enabled_exchanges"] == ["binance", "bybit"]
    assert data["enabled_symbols"] == ["BTC/USDT", "ETH/USDT"]
    assert data["notification_channels"]["email"] == True

def test_check_position_limits(mock_db, mock_alert_service):
    response = client.post(
        "/api/v1/alerts/check-position-limits/binance",
        params={
            "api_key": "test_key",
            "api_secret": "test_secret"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Position limits checked" 