import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from ..services.alert_service import AlertService
from ..models.alert import Alert, AlertSettings
from ..database import get_db

@pytest.fixture
def mock_db():
    with patch('QTi.backend.services.alert_service.get_db') as mock:
        yield mock

@pytest.fixture
def mock_exchange_service():
    with patch('QTi.backend.services.alert_service.ExchangeService') as mock:
        yield mock

@pytest.fixture
def mock_email_service():
    with patch('QTi.backend.services.alert_service.EmailService') as mock:
        yield mock

@pytest.fixture
def mock_telegram_service():
    with patch('QTi.backend.services.alert_service.TelegramService') as mock:
        yield mock

@pytest.fixture
def db_session():
    return Mock()

@pytest.fixture
def alert_service(db_session):
    return AlertService(db_session)

def test_create_alert(alert_service, db_session):
    alert = alert_service.create_alert(
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning"
    )

    assert alert.type == "position_limit"
    assert alert.exchange == "binance"
    assert alert.symbol == "BTC/USDT"
    assert alert.message == "Test alert"
    assert alert.severity == "warning"
    assert alert.read == False
    assert isinstance(alert.created_at, datetime)

    db_session.add.assert_called_once()
    db_session.commit.assert_called_once()
    db_session.refresh.assert_called_once()

def test_get_alerts(mock_db):
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
    mock_db.return_value.query.return_value.all.return_value = mock_alerts

    service = AlertService()
    alerts = service.get_alerts()
    assert len(alerts) == 1
    assert alerts[0].type == "position_limit"
    assert alerts[0].exchange == "binance"

def test_get_alerts_with_filters(alert_service, db_session):
    mock_alerts = [
        Alert(
            type="position_limit",
            exchange="binance",
            symbol="BTC/USDT",
            message="Test alert",
            severity="warning"
        )
    ]
    db_session.query.return_value.filter.return_value.order_by.return_value.all.return_value = mock_alerts

    alerts = alert_service.get_alerts(
        exchange="binance",
        symbol="BTC/USDT",
        type="position_limit",
        read=False
    )

    assert len(alerts) == 1
    assert alerts[0].exchange == "binance"
    assert alerts[0].symbol == "BTC/USDT"
    assert alerts[0].type == "position_limit"

def test_get_unread_alerts(mock_db):
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
    mock_db.return_value.query.return_value.filter.return_value.all.return_value = mock_alerts

    service = AlertService()
    alerts = service.get_unread_alerts()
    assert len(alerts) == 1
    assert alerts[0].read == False

def test_mark_alert_as_read(mock_db):
    mock_alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    mock_db.return_value.query.return_value.filter.return_value.first.return_value = mock_alert

    service = AlertService()
    alert = service.mark_alert_as_read(1)
    assert alert.read == True

def test_mark_all_alerts_as_read(mock_db):
    service = AlertService()
    service.mark_all_alerts_as_read()
    mock_db.return_value.query.return_value.update.assert_called_once()

def test_delete_alert(mock_db):
    mock_alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )
    mock_db.return_value.query.return_value.filter.return_value.first.return_value = mock_alert

    service = AlertService()
    service.delete_alert(1)
    mock_db.return_value.delete.assert_called_once_with(mock_alert)

def test_clear_all_alerts(mock_db):
    service = AlertService()
    service.clear_all_alerts()
    mock_db.return_value.query.return_value.delete.assert_called_once()

def test_get_alert_settings(mock_db):
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
    mock_db.return_value.query.return_value.first.return_value = mock_settings

    service = AlertService()
    settings = service.get_alert_settings()
    assert settings.position_limit_threshold == 10
    assert settings.enabled_exchanges == ["binance"]
    assert settings.enabled_symbols == ["BTC/USDT"]
    assert settings.notification_channels["web"] == True

def test_update_alert_settings(mock_db):
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
    mock_db.return_value.query.return_value.first.return_value = mock_settings

    service = AlertService()
    settings = service.update_alert_settings(
        position_limit_threshold=20,
        enabled_exchanges=["binance", "bybit"],
        enabled_symbols=["BTC/USDT", "ETH/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )
    assert settings.position_limit_threshold == 20
    assert settings.enabled_exchanges == ["binance", "bybit"]
    assert settings.enabled_symbols == ["BTC/USDT", "ETH/USDT"]
    assert settings.notification_channels["email"] == True

@patch('QTi.backend.services.alert_service.ExchangeFactory')
def test_check_position_limits(mock_exchange_factory, alert_service, mock_db, mock_exchange_service, mock_email_service, mock_telegram_service):
    mock_positions = [
        {
            "symbol": "BTC/USDT",
            "side": "long",
            "entry_price": 50000,
            "mark_price": 55000,
            "quantity": 1,
            "leverage": 10,
            "margin_type": "isolated",
            "liquidation_price": 45000,
            "unrealized_pnl": 5000,
            "realized_pnl": 0
        }
    ]
    mock_exchange_service.return_value.get_positions.return_value = mock_positions

    mock_settings = AlertSettings(
        id=1,
        position_limit_threshold=5,
        enabled_exchanges=["binance"],
        enabled_symbols=["BTC/USDT"],
        notification_channels={
            "email": True,
            "telegram": True,
            "web": True
        }
    )
    mock_db.return_value.query.return_value.first.return_value = mock_settings

    service = AlertService()
    service.check_position_limits("binance", "test_key", "test_secret")
    mock_exchange_service.return_value.get_positions.assert_called_once_with(
        "binance",
        "test_key",
        "test_secret"
    )
    mock_email_service.return_value.send_alert.assert_called_once()
    mock_telegram_service.return_value.send_alert.assert_called_once() 