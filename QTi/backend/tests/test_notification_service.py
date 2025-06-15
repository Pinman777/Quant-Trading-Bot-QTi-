import pytest
from unittest.mock import Mock, patch
from ..services.notification_service import NotificationService
from ..models.alert import Alert

@pytest.fixture
def mock_email_service():
    with patch('QTi.backend.services.notification_service.EmailService') as mock:
        yield mock

@pytest.fixture
def mock_telegram_service():
    with patch('QTi.backend.services.notification_service.TelegramService') as mock:
        yield mock

def test_send_notification_email(mock_email_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "email": True,
        "telegram": False,
        "web": True
    }

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_called_once_with(alert)

def test_send_notification_telegram(mock_telegram_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "email": False,
        "telegram": True,
        "web": True
    }

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_telegram_service.return_value.send_alert.assert_called_once_with(alert)

def test_send_notification_all_channels(mock_email_service, mock_telegram_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "email": True,
        "telegram": True,
        "web": True
    }

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_called_once_with(alert)
    mock_telegram_service.return_value.send_alert.assert_called_once_with(alert)

def test_send_notification_no_channels(mock_email_service, mock_telegram_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "email": False,
        "telegram": False,
        "web": True
    }

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_not_called()
    mock_telegram_service.return_value.send_alert.assert_not_called()

def test_send_notification_error_handling(mock_email_service, mock_telegram_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "email": True,
        "telegram": True,
        "web": True
    }

    mock_email_service.return_value.send_alert.side_effect = Exception("Email error")
    mock_telegram_service.return_value.send_alert.side_effect = Exception("Telegram error")

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_called_once_with(alert)
    mock_telegram_service.return_value.send_alert.assert_called_once_with(alert)

def test_send_notification_invalid_channels(mock_email_service, mock_telegram_service):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    notification_channels = {
        "invalid_channel": True
    }

    service = NotificationService()
    service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_not_called()
    mock_telegram_service.return_value.send_alert.assert_not_called()

def test_send_notification_invalid_alert(mock_email_service, mock_telegram_service):
    alert = None
    notification_channels = {
        "email": True,
        "telegram": True,
        "web": True
    }

    service = NotificationService()
    with pytest.raises(ValueError):
        service.send_notification(alert, notification_channels)
    mock_email_service.return_value.send_alert.assert_not_called()
    mock_telegram_service.return_value.send_alert.assert_not_called() 