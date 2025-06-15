import pytest
from fastapi import HTTPException
from app.exceptions import (
    QTiException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    DatabaseError,
    APIError,
    BotError,
    ServerError,
    MarketError,
    ConfigurationError
)

def test_qti_exception():
    # Test base exception
    with pytest.raises(QTiException) as exc_info:
        raise QTiException("Test error")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Test error"

def test_authentication_error():
    # Test authentication error
    with pytest.raises(AuthenticationError) as exc_info:
        raise AuthenticationError("Invalid credentials")
    
    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid credentials"

def test_authorization_error():
    # Test authorization error
    with pytest.raises(AuthorizationError) as exc_info:
        raise AuthorizationError("Insufficient permissions")
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "Insufficient permissions"

def test_not_found_error():
    # Test not found error
    with pytest.raises(NotFoundError) as exc_info:
        raise NotFoundError("Resource not found")
    
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Resource not found"

def test_validation_error():
    # Test validation error
    with pytest.raises(ValidationError) as exc_info:
        raise ValidationError("Invalid input")
    
    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "Invalid input"

def test_database_error():
    # Test database error
    with pytest.raises(DatabaseError) as exc_info:
        raise DatabaseError("Database connection failed")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Database connection failed"

def test_api_error():
    # Test API error
    with pytest.raises(APIError) as exc_info:
        raise APIError("External API error")
    
    assert exc_info.value.status_code == 502
    assert exc_info.value.detail == "External API error"

def test_bot_error():
    # Test bot error
    with pytest.raises(BotError) as exc_info:
        raise BotError("Bot configuration error")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Bot configuration error"

def test_server_error():
    # Test server error
    with pytest.raises(ServerError) as exc_info:
        raise ServerError("Server connection failed")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Server connection failed"

def test_market_error():
    # Test market error
    with pytest.raises(MarketError) as exc_info:
        raise MarketError("Market data error")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Market data error"

def test_configuration_error():
    # Test configuration error
    with pytest.raises(ConfigurationError) as exc_info:
        raise ConfigurationError("Invalid configuration")
    
    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Invalid configuration"

def test_exception_inheritance():
    # Test exception inheritance
    assert issubclass(AuthenticationError, QTiException)
    assert issubclass(AuthorizationError, QTiException)
    assert issubclass(NotFoundError, QTiException)
    assert issubclass(ValidationError, QTiException)
    assert issubclass(DatabaseError, QTiException)
    assert issubclass(APIError, QTiException)
    assert issubclass(BotError, QTiException)
    assert issubclass(ServerError, QTiException)
    assert issubclass(MarketError, QTiException)
    assert issubclass(ConfigurationError, QTiException)

def test_exception_default_messages():
    # Test default messages
    auth_error = AuthenticationError()
    assert auth_error.detail == "Authentication failed"
    
    auth_error = AuthorizationError()
    assert auth_error.detail == "Not authorized"
    
    not_found_error = NotFoundError()
    assert not_found_error.detail == "Resource not found"
    
    validation_error = ValidationError()
    assert validation_error.detail == "Validation failed"
    
    database_error = DatabaseError()
    assert database_error.detail == "Database error"
    
    api_error = APIError()
    assert api_error.detail == "API error"
    
    bot_error = BotError()
    assert bot_error.detail == "Bot error"
    
    server_error = ServerError()
    assert server_error.detail == "Server error"
    
    market_error = MarketError()
    assert market_error.detail == "Market data error"
    
    config_error = ConfigurationError()
    assert config_error.detail == "Configuration error"

def test_exception_custom_messages():
    # Test custom messages
    auth_error = AuthenticationError("Custom auth error")
    assert auth_error.detail == "Custom auth error"
    
    auth_error = AuthorizationError("Custom auth error")
    assert auth_error.detail == "Custom auth error"
    
    not_found_error = NotFoundError("Custom not found error")
    assert not_found_error.detail == "Custom not found error"
    
    validation_error = ValidationError("Custom validation error")
    assert validation_error.detail == "Custom validation error"
    
    database_error = DatabaseError("Custom database error")
    assert database_error.detail == "Custom database error"
    
    api_error = APIError("Custom API error")
    assert api_error.detail == "Custom API error"
    
    bot_error = BotError("Custom bot error")
    assert bot_error.detail == "Custom bot error"
    
    server_error = ServerError("Custom server error")
    assert server_error.detail == "Custom server error"
    
    market_error = MarketError("Custom market error")
    assert market_error.detail == "Custom market error"
    
    config_error = ConfigurationError("Custom config error")
    assert config_error.detail == "Custom config error"

def test_exception_status_codes():
    # Test status codes
    assert AuthenticationError().status_code == 401
    assert AuthorizationError().status_code == 403
    assert NotFoundError().status_code == 404
    assert ValidationError().status_code == 422
    assert DatabaseError().status_code == 500
    assert APIError().status_code == 502
    assert BotError().status_code == 500
    assert ServerError().status_code == 500
    assert MarketError().status_code == 500
    assert ConfigurationError().status_code == 500

def test_exception_headers():
    # Test headers
    auth_error = AuthenticationError()
    assert auth_error.headers == {"WWW-Authenticate": "Bearer"}
    
    auth_error = AuthorizationError()
    assert auth_error.headers == {}
    
    not_found_error = NotFoundError()
    assert not_found_error.headers == {}
    
    validation_error = ValidationError()
    assert validation_error.headers == {}
    
    database_error = DatabaseError()
    assert database_error.headers == {}
    
    api_error = APIError()
    assert api_error.headers == {}
    
    bot_error = BotError()
    assert bot_error.headers == {}
    
    server_error = ServerError()
    assert server_error.headers == {}
    
    market_error = MarketError()
    assert market_error.headers == {}
    
    config_error = ConfigurationError()
    assert config_error.headers == {}

def test_exception_custom_headers():
    # Test custom headers
    auth_error = AuthenticationError(headers={"Custom-Header": "value"})
    assert auth_error.headers == {"WWW-Authenticate": "Bearer", "Custom-Header": "value"}
    
    auth_error = AuthorizationError(headers={"Custom-Header": "value"})
    assert auth_error.headers == {"Custom-Header": "value"}
    
    not_found_error = NotFoundError(headers={"Custom-Header": "value"})
    assert not_found_error.headers == {"Custom-Header": "value"}
    
    validation_error = ValidationError(headers={"Custom-Header": "value"})
    assert validation_error.headers == {"Custom-Header": "value"}
    
    database_error = DatabaseError(headers={"Custom-Header": "value"})
    assert database_error.headers == {"Custom-Header": "value"}
    
    api_error = APIError(headers={"Custom-Header": "value"})
    assert api_error.headers == {"Custom-Header": "value"}
    
    bot_error = BotError(headers={"Custom-Header": "value"})
    assert bot_error.headers == {"Custom-Header": "value"}
    
    server_error = ServerError(headers={"Custom-Header": "value"})
    assert server_error.headers == {"Custom-Header": "value"}
    
    market_error = MarketError(headers={"Custom-Header": "value"})
    assert market_error.headers == {"Custom-Header": "value"}
    
    config_error = ConfigurationError(headers={"Custom-Header": "value"})
    assert config_error.headers == {"Custom-Header": "value"} 