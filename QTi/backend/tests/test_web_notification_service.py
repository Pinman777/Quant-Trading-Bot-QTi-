import pytest
from unittest.mock import Mock, patch
from ..services.web_notification_service import WebNotificationService
from ..models.alert import Alert
from ..config import Settings

@pytest.fixture
def mock_websocket():
    with patch('websockets.connect') as mock:
        yield mock

@pytest.fixture
def mock_settings():
    settings = Settings(
        websocket_url="ws://localhost:8000/ws"
    )
    return settings

def test_send_alert(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.return_value.__aenter__.return_value.send.return_value = None

    service = WebNotificationService(mock_settings)
    service.send_alert(alert)

    mock_websocket.return_value.__aenter__.return_value.send.assert_called_once()

def test_send_alert_error_handling(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.return_value.__aenter__.return_value.send.side_effect = Exception("WebSocket error")

    service = WebNotificationService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_settings(mock_websocket):
    settings = Settings(
        websocket_url=""
    )

    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    service = WebNotificationService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_invalid_alert(mock_websocket, mock_settings):
    alert = None

    service = WebNotificationService(mock_settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_connection_error(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.side_effect = Exception("Connection error")

    service = WebNotificationService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_url(mock_websocket):
    settings = Settings(
        websocket_url="invalid_url"
    )

    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    service = WebNotificationService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_websocket_closed(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.return_value.__aenter__.return_value.send.side_effect = Exception("WebSocket is closed")

    service = WebNotificationService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_websocket_timeout(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.return_value.__aenter__.return_value.send.side_effect = Exception("WebSocket timeout")

    service = WebNotificationService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_websocket_protocol_error(mock_websocket, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_websocket.return_value.__aenter__.return_value.send.side_effect = Exception("WebSocket protocol error")

    service = WebNotificationService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert) 