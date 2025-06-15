import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.exceptions import (
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
from fastapi import HTTPException
import json

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_exception_lifecycle(client, app):
    # Test complete exception lifecycle
    @app.get("/test")
    def test_endpoint():
        raise AuthenticationError()
    
    # Test exception raising
    response = client.get("/test")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication failed"
    
    # Test exception handling
    @app.exception_handler(QTiException)
    async def qti_exception_handler(request, exc):
        return {
            "status_code": exc.status_code,
            "detail": exc.detail,
            "headers": exc.headers
        }
    
    response = client.get("/test")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication failed"

def test_exception_types(client, app):
    # Test different exception types
    @app.get("/auth")
    def auth_endpoint():
        raise AuthenticationError()
    
    @app.get("/authz")
    def authz_endpoint():
        raise AuthorizationError()
    
    @app.get("/not-found")
    def not_found_endpoint():
        raise NotFoundError()
    
    @app.get("/validation")
    def validation_endpoint():
        raise ValidationError()
    
    @app.get("/database")
    def database_endpoint():
        raise DatabaseError()
    
    @app.get("/api")
    def api_endpoint():
        raise APIError()
    
    @app.get("/bot")
    def bot_endpoint():
        raise BotError()
    
    @app.get("/server")
    def server_endpoint():
        raise ServerError()
    
    @app.get("/market")
    def market_endpoint():
        raise MarketError()
    
    @app.get("/config")
    def config_endpoint():
        raise ConfigurationError()
    
    # Test responses
    assert client.get("/auth").status_code == 401
    assert client.get("/authz").status_code == 403
    assert client.get("/not-found").status_code == 404
    assert client.get("/validation").status_code == 422
    assert client.get("/database").status_code == 500
    assert client.get("/api").status_code == 502
    assert client.get("/bot").status_code == 500
    assert client.get("/server").status_code == 500
    assert client.get("/market").status_code == 500
    assert client.get("/config").status_code == 500

def test_exception_messages(client, app):
    # Test custom exception messages
    @app.get("/custom")
    def custom_endpoint():
        raise AuthenticationError("Custom auth error")
    
    response = client.get("/custom")
    assert response.status_code == 401
    assert response.json()["detail"] == "Custom auth error"

def test_exception_headers(client, app):
    # Test exception headers
    @app.get("/headers")
    def headers_endpoint():
        raise AuthenticationError(headers={"X-Custom": "value"})
    
    response = client.get("/headers")
    assert response.status_code == 401
    assert response.headers["X-Custom"] == "value"

def test_exception_inheritance(client):
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
    assert issubclass(QTiException, HTTPException)

def test_exception_validation(client, app):
    # Test exception validation
    @app.get("/invalid")
    def invalid_endpoint():
        raise QTiException(status_code=999, detail="Invalid status code")
    
    response = client.get("/invalid")
    assert response.status_code == 999
    assert response.json()["detail"] == "Invalid status code"

def test_exception_error_handling(client, app):
    # Test error handling
    @app.get("/error")
    def error_endpoint():
        raise Exception("Unexpected error")
    
    @app.exception_handler(Exception)
    async def exception_handler(request, exc):
        return {
            "status_code": 500,
            "detail": str(exc)
        }
    
    response = client.get("/error")
    assert response.status_code == 500
    assert response.json()["detail"] == "Unexpected error"

def test_exception_security(client, app):
    # Test exception security
    @app.get("/security")
    def security_endpoint():
        raise AuthenticationError("SQL injection: '; DROP TABLE users; --")
    
    response = client.get("/security")
    assert response.status_code == 401
    assert "DROP TABLE" not in response.json()["detail"]
    
    @app.get("/xss")
    def xss_endpoint():
        raise AuthenticationError("<script>alert('test')</script>")
    
    response = client.get("/xss")
    assert response.status_code == 401
    assert "<script>" not in response.json()["detail"]

def test_exception_performance(client, app):
    # Test exception performance
    @app.get("/performance")
    def performance_endpoint():
        raise AuthenticationError()
    
    import time
    start_time = time.time()
    for _ in range(1000):
        client.get("/performance")
    end_time = time.time()
    
    assert end_time - start_time < 10.0  # Should be reasonably fast

def test_exception_concurrency(client, app):
    # Test exception concurrency
    import threading
    
    @app.get("/concurrency")
    def concurrency_endpoint():
        raise AuthenticationError()
    
    def make_request():
        for _ in range(100):
            client.get("/concurrency")
    
    # Create threads
    threads = []
    for _ in range(10):
        threads.append(threading.Thread(target=make_request))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    response = client.get("/concurrency")
    assert response.status_code == 401 