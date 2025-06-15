import pytest
from unittest.mock import Mock, patch
from ..services.liquidation_alert_service import LiquidationAlertService
from ..models.alert import Alert, AlertSettings
from ..config import Settings

@pytest.fixture
def mock_exchange_service():
    with patch('QTi.backend.services.liquidation_alert_service.ExchangeService') as mock:
        yield mock

@pytest.fixture
def mock_notification_service():
    with patch('QTi.backend.services.liquidation_alert_service.NotificationService') as mock:
        yield mock

@pytest.fixture
def mock_settings():
    settings = Settings(
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"]
    )
    return settings

def test_check_liquidation_risk(mock_exchange_service, mock_notification_service, mock_settings):
    mock_positions = [
        {
            "symbol": "BTC/USDT",
            "side": "long",
            "entry_price": 50000,
            "mark_price": 45000,
            "quantity": 1,
            "leverage": 10,
            "margin_type": "isolated",
            "liquidation_price": 45000,
            "unrealized_pnl": -5000,
            "realized_pnl": 0
        }
    ]
    mock_exchange_service.return_value.get_positions.return_value = mock_positions

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_positions.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_called_once()

def test_check_liquidation_risk_no_positions(mock_exchange_service, mock_notification_service, mock_settings):
    mock_positions = []
    mock_exchange_service.return_value.get_positions.return_value = mock_positions

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_positions.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_liquidation_risk_disabled_exchange(mock_exchange_service, mock_notification_service, mock_settings):
    mock_positions = [
        {
            "symbol": "BTC/USDT",
            "side": "long",
            "entry_price": 50000,
            "mark_price": 45000,
            "quantity": 1,
            "leverage": 10,
            "margin_type": "isolated",
            "liquidation_price": 45000,
            "unrealized_pnl": -5000,
            "realized_pnl": 0
        }
    ]
    mock_exchange_service.return_value.get_positions.return_value = mock_positions

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["bybit"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_positions.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_liquidation_risk_disabled_symbol(mock_exchange_service, mock_notification_service, mock_settings):
    mock_positions = [
        {
            "symbol": "ETH/USDT",
            "side": "long",
            "entry_price": 3000,
            "mark_price": 2700,
            "quantity": 1,
            "leverage": 10,
            "margin_type": "isolated",
            "liquidation_price": 2700,
            "unrealized_pnl": -300,
            "realized_pnl": 0
        }
    ]
    mock_exchange_service.return_value.get_positions.return_value = mock_positions

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

    mock_exchange_service.return_value.get_positions.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_notification_service.return_value.send_notification.assert_not_called()

def test_check_liquidation_risk_error_handling(mock_exchange_service, mock_notification_service, mock_settings):
    mock_exchange_service.return_value.get_positions.side_effect = Exception("API error")

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    with pytest.raises(Exception):
        service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_liquidation_risk_invalid_settings(mock_exchange_service, mock_notification_service):
    settings = Settings(
        liquidation_threshold=-1,
        enabled_exchanges=[],
        enabled_symbols=[]
    )

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(settings)
    with pytest.raises(ValueError):
        service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_liquidation_risk_invalid_alert_settings(mock_exchange_service, mock_notification_service, mock_settings):
    mock_alert_settings = None

    service = LiquidationAlertService(mock_settings)
    with pytest.raises(ValueError):
        service.check_liquidation_risk("binance", "test_key", "test_secret", mock_alert_settings)

def test_check_liquidation_risk_invalid_api_credentials(mock_exchange_service, mock_notification_service, mock_settings):
    mock_exchange_service.return_value.get_positions.side_effect = Exception("Invalid API credentials")

    mock_alert_settings = AlertSettings(
        id=1,
        liquidation_threshold=0.1,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )

    service = LiquidationAlertService(mock_settings)
    with pytest.raises(Exception):
        service.check_liquidation_risk("binance", "", "", mock_alert_settings) 