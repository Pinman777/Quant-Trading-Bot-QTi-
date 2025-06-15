import pytest
from unittest.mock import Mock, patch
from ..services.email_service import EmailService
from ..models.alert import Alert
from ..config import Settings

@pytest.fixture
def mock_smtp():
    with patch('smtplib.SMTP_SSL') as mock:
        yield mock

@pytest.fixture
def mock_settings():
    settings = Settings(
        email_host="smtp.gmail.com",
        email_port=465,
        email_username="test@gmail.com",
        email_password="test_password",
        email_from="test@gmail.com",
        email_to="recipient@gmail.com"
    )
    return settings

def test_send_alert(mock_smtp, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    service = EmailService(mock_settings)
    service.send_alert(alert)

    mock_smtp.return_value.__enter__.return_value.sendmail.assert_called_once()
    mock_smtp.return_value.__enter__.return_value.quit.assert_called_once()

def test_send_alert_error_handling(mock_smtp, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_smtp.return_value.__enter__.return_value.sendmail.side_effect = Exception("SMTP error")

    service = EmailService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_invalid_settings(mock_smtp):
    settings = Settings(
        email_host="",
        email_port=465,
        email_username="",
        email_password="",
        email_from="",
        email_to=""
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

    service = EmailService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_invalid_alert(mock_smtp, mock_settings):
    alert = None

    service = EmailService(mock_settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_invalid_port(mock_smtp):
    settings = Settings(
        email_host="smtp.gmail.com",
        email_port=-1,
        email_username="test@gmail.com",
        email_password="test_password",
        email_from="test@gmail.com",
        email_to="recipient@gmail.com"
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

    service = EmailService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_invalid_email_format(mock_smtp):
    settings = Settings(
        email_host="smtp.gmail.com",
        email_port=465,
        email_username="test@gmail.com",
        email_password="test_password",
        email_from="invalid_email",
        email_to="invalid_email"
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

    service = EmailService(settings)
    with pytest.raises(ValueError):
        service.send_alert(alert)

def test_send_alert_smtp_connection_error(mock_smtp, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_smtp.side_effect = Exception("Connection error")

    service = EmailService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert)

def test_send_alert_smtp_authentication_error(mock_smtp, mock_settings):
    alert = Alert(
        id=1,
        type="position_limit",
        exchange="binance",
        symbol="BTC/USDT",
        message="Test alert",
        severity="warning",
        read=False
    )

    mock_smtp.return_value.__enter__.return_value.login.side_effect = Exception("Authentication error")

    service = EmailService(mock_settings)
    with pytest.raises(Exception):
        service.send_alert(alert) 