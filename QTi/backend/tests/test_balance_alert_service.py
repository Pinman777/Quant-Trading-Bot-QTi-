import pytest
from unittest.mock import Mock, patch
from ..services.balance_alert_service import BalanceAlertService
from ..models.alert import Alert, AlertSettings
from ..config import Settings

@pytest.fixture
def mock_exchange_service():
    with patch('QTi.backend.services.balance_alert_service.ExchangeService') as mock:
        yield mock

@pytest.fixture
def mock_notification_service():
    with patch('QTi.backend.services.balance_alert_service.NotificationService') as mock:
        yield mock

@pytest.fixture
def mock_settings():
    settings = Settings(
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"]
    )
    return settings

def test_check_balance_limits(mock_exchange_service, mock_notification_service, mock_settings):
    mock_balances = [
        {
            "asset": "USDT",
            "free": 500,
            "locked": 0,
            "total": 500
        }
    ]
    mock_exchange_service.return_value.get_balances.return_value = mock_balances

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_balances.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_called_once()

def test_check_balance_limits_no_balances(mock_exchange_service, mock_notification_service, mock_settings):
    mock_balances = []
    mock_exchange_service.return_value.get_balances.return_value = mock_balances

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_balances.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_balance_limits_disabled_exchange(mock_exchange_service, mock_notification_service, mock_settings):
    mock_balances = [
        {
            "asset": "USDT",
            "free": 500,
            "locked": 0,
            "total": 500
        }
    ]
    mock_exchange_service.return_value.get_balances.return_value = mock_balances

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["bybit"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_balances.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_balance_limits_disabled_symbol(mock_exchange_service, mock_notification_service, mock_settings):
    mock_balances = [
        {
            "asset": "BTC",
            "free": 0.1,
            "locked": 0,
            "total": 0.1
        }
    ]
    mock_exchange_service.return_value.get_balances.return_value = mock_balances

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_balances.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_balance_limits_error_handling(mock_exchange_service, mock_notification_service, mock_settings):
    mock_exchange_service.return_value.get_balances.side_effect = Exception("API error")

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    with pytest.raises(Exception):
        service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_balance_limits_invalid_settings(mock_exchange_service, mock_notification_service):
    settings = Settings(
        balance_limit_threshold=-1,
        enabled_exchanges=[],
        enabled_symbols=[]
    )

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(settings)
    with pytest.raises(ValueError):
        service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_balance_limits_invalid_alert_settings(mock_exchange_service, mock_notification_service, mock_settings):
    mock_alert_settings = None

    service = BalanceAlertService(mock_settings)
    with pytest.raises(ValueError):
        service.check_balance_limits("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_balance_limits_invalid_api_credentials(mock_exchange_service, mock_notification_service, mock_settings):
    mock_exchange_service.return_value.get_balances.side_effect = Exception("Invalid API credentials")

    mock_alert_settings = AlertSettings(
        id=1,
        balance_limit_threshold=1000,
        enabled_exchanges=["binance"],
        enabled_symbols=["USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = BalanceAlertService(mock_settings)
    with pytest.raises(Exception):
        service.check_balance_limits("binance", "", "", mock_alert_settings) 