import pytest
from unittest.mock import Mock, patch
from ..services.telegram_service import TelegramService
from ..models.alert import Alert
from ..config import Settings

@pytest.fixture
def mock_requests():
    with patch('requests.post') as mock:
        yield mock

@pytest.fixture
def mock_settings():
    settings = Settings(
        telegram_bot_token="test_token",
        telegram_chat_id="test_chat_id"
    )
    return settings

def test_send_alert(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.return_value.status_code = 200
    mock_requests.return_value.json.return_value = {"ok": True}

    service = TelegramService(mock_settings)
    service.send_alert(alert)

    mock_requests.assert_called_once()
    assert "test_token" in mock_requests.call_args[0][0]
    assert "test_chat_id" in mock_requests.call_args[1]["data"]["chat_id"]

def test_send_alert_error_handling(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.return_value.status_code = 400
    mock_requests.return_value.json.return_value = {"ok": False, "description": "Bad Request"}

    service = TelegramService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_settings(mock_requests):
    settings = Settings(
        telegram_bot_token="",
        telegram_chat_id=""
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

    service = TelegramService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_invalid_alert(mock_requests, mock_settings):
    alert = None

    service = TelegramService(mock_settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_network_error(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.side_effect = Exception("Network error")

    service = TelegramService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_token(mock_requests):
    settings = Settings(
        telegram_bot_token="invalid_token",
        telegram_chat_id="test_chat_id"
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

    mock_requests.return_value.status_code = 401
    mock_requests.return_value.json.return_value = {"ok": False, "description": "Unauthorized"}

    service = TelegramService(settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_chat_id(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.return_value.status_code = 400
    mock_requests.return_value.json.return_value = {"ok": False, "description": "Chat not found"}

    service = TelegramService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_rate_limit(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.return_value.status_code = 429
    mock_requests.return_value.json.return_value = {"ok": False, "description": "Too Many Requests"}

    service = TelegramService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_server_error(mock_requests, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_requests.return_value.status_code = 500
    mock_requests.return_value.json.return_value = {"ok": False, "description": "Internal Server Error"}

    service = TelegramService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert) 