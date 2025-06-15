import pytest
from datetime import datetime
from ..models.alert import Alert, AlertSettings

def test_alert_creation():
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        created_at=datetime.now(),
        read=False
    )
    assert alert.id == 1
    assert alert.type == "position_limit"
    assert alert.exchange == "binance"
    assert alert.symbol == "BTC/USDT"
    assert alert.message == "Test alert"
    assert alert.severity == "warning"
    assert alert.read == False

def test_alert_settings_creation():
    settings = AlertSettings(
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
    assert settings.id == 1
    assert settings.position_limit_threshold == 10
    assert settings.enabled_exchanges == ["binance"]
    assert settings.enabled_symbols == ["BTC/USDT"]
    assert settings.notification_channels["web"] == True

def test_alert_settings_default_values():
    settings = AlertSettings()
    assert settings.position_limit_threshold == 5
    assert settings.enabled_exchanges == []
    assert settings.enabled_symbols == []
    assert settings.notification_channels == {
        "email": False,
        "telegram": False,
        "web": True
    }

def test_alert_validation():
    with pytest.raises(ValueError):
        Alert(
            id=1,
            type="invalid_type",
            exchange="binance",
            symbol="BTC/USDT",
            message="Test alert",
            severity="warning",
            read=False
        )

    with pytest.raises(ValueError):
        Alert(
            id=1,
            type="position_limit",
            exchange="binance",
            symbol="BTC/USDT",
            message="Test alert",
            severity="invalid_severity",
            read=False
        )

def test_alert_settings_validation():
    with pytest.raises(ValueError):
        AlertSettings(
            id=1,
            position_limit_threshold=-1,
            enabled_exchanges=["binance"],
            enabled_symbols=["BTC/USDT"],
            notification_channels={
                "email": False,
                "telegram": False,
                "web": True
            }
        )

    with pytest.raises(ValueError):
        AlertSettings(
            id=1,
            position_limit_threshold=10,
            enabled_exchanges=["invalid_exchange"],
            enabled_symbols=["BTC/USDT"],
            notification_channels={
                "email": False,
                "telegram": False,
                "web": True
            }
        )

def test_alert_serialization():
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        created_at=datetime.now(),
        read=False
    )
    data = alert.dict()
    assert data["id"] == 1
    assert data["type"] == "position_limit"
    assert data["exchange"] == "binance"
    assert data["symbol"] == "BTC/USDT"
    assert data["message"] == "Test alert"
    assert data["severity"] == "warning"
    assert data["read"] == False

def test_alert_settings_serialization():
    settings = AlertSettings(
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
    data = settings.dict()
    assert data["id"] == 1
    assert data["position_limit_threshold"] == 10
    assert data["enabled_exchanges"] == ["binance"]
    assert data["enabled_symbols"] == ["BTC/USDT"]
    assert data["notification_channels"]["web"] == True 