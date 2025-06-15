import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from app.core.middleware import (
    RequestLoggingMiddleware,
    ErrorHandlingMiddleware,
    SecurityMiddleware,
    setup_middleware
)
from app.core.config import settings
import json
import time
import logging

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_middleware_lifecycle(client, app):
    # Test complete middleware lifecycle
    # Setup middleware
    setup_middleware(app)
    
    @app.get("/test")
    def test_endpoint():
        return {"message": "test"}
    
    # Test request logging
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json()["message"] == "test"
    
    # Test error handling
    @app.get("/error")
    def error_endpoint():
        raise Exception("Test error")
    
    response = client.get("/error")
    assert response.status_code == 500
    assert "error" in response.json()
    
    # Test security headers
    response = client.get("/test")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"

def test_request_logging_middleware(client, app):
    # Test request logging middleware
    app.add_middleware(RequestLoggingMiddleware)
    
    @app.get("/test")
    def test_endpoint():
        return {"message": "test"}
    
    # Test successful request
    response = client.get("/test")
    assert response.status_code == 200
    
    # Test request with query parameters
    response = client.get("/test?param=value")
    assert response.status_code == 200
    
    # Test request with headers
    response = client.get("/test", headers={"X-Test": "value"})
    assert response.status_code == 200
    
    # Test request with body
    response = client.post("/test", json={"data": "value"})
    assert response.status_code == 200

def test_error_handling_middleware(client, app):
    # Test error handling middleware
    app.add_middleware(ErrorHandlingMiddleware)
    
    @app.get("/error")
    def error_endpoint():
        raise Exception("Test error")
    
    # Test error handling
    response = client.get("/error")
    assert response.status_code == 500
    assert "error" in response.json()
    
    # Test custom error
    @app.get("/custom-error")
    def custom_error_endpoint():
        raise ValueError("Custom error")
    
    response = client.get("/custom-error")
    assert response.status_code == 500
    assert "error" in response.json()
    
    # Test HTTP error
    @app.get("/http-error")
    def http_error_endpoint():
        raise HTTPException(status_code=400, detail="Bad request")
    
    response = client.get("/http-error")
    assert response.status_code == 400
    assert "detail" in response.json()

def test_security_middleware(client, app):
    # Test security middleware
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/test")
    def test_endpoint():
        return {"message": "test"}
    
    # Test security headers
    response = client.get("/test")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"
    assert response.headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"
    assert response.headers["Content-Security-Policy"] == "default-src 'self'"
    
    # Test CORS headers
    response = client.options("/test")
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers

def test_middleware_order(client, app):
    # Test middleware order
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/test")
    def test_endpoint():
        return {"message": "test"}
    
    # Test middleware execution order
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json()["message"] == "test"
    assert response.headers["X-Content-Type-Options"] == "nosniff"

def test_middleware_validation(client, app):
    # Test middleware validation
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/validation")
    def validation_endpoint():
        return {"message": "test"}
    
    # Test request validation
    response = client.get("/validation", headers={"Content-Type": "application/json"})
    assert response.status_code == 200
    
    # Test response validation
    response = client.get("/validation")
    assert response.status_code == 200
    assert "Content-Type" in response.headers
    assert response.headers["Content-Type"] == "application/json"

def test_middleware_error_handling(client, app):
    # Test middleware error handling
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/error")
    def error_endpoint():
        raise Exception("Test error")
    
    # Test error handling
    response = client.get("/error")
    assert response.status_code == 500
    assert "error" in response.json()
    
    # Test error logging
    response = client.get("/error")
    assert response.status_code == 500
    
    # Test error headers
    response = client.get("/error")
    assert response.headers["X-Content-Type-Options"] == "nosniff"

def test_middleware_security(client, app):
    # Test middleware security
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/security")
    def security_endpoint():
        return {"message": "test"}
    
    # Test SQL injection prevention
    response = client.get("/security?param='; DROP TABLE users; --")
    assert response.status_code == 200
    
    # Test XSS prevention
    response = client.get("/security?param=<script>alert('test')</script>")
    assert response.status_code == 200
    
    # Test path traversal prevention
    response = client.get("/security/../../../etc/passwd")
    assert response.status_code == 404

def test_middleware_performance(client, app):
    # Test middleware performance
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/performance")
    def performance_endpoint():
        return {"message": "test"}
    
    # Test request performance
    start_time = time.time()
    for _ in range(1000):
        client.get("/performance")
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast
    
    # Test error performance
    @app.get("/error-performance")
    def error_performance_endpoint():
        raise Exception("Test error")
    
    start_time = time.time()
    for _ in range(1000):
        client.get("/error-performance")
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast

def test_middleware_concurrency(client, app):
    # Test middleware concurrency
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(SecurityMiddleware)
    
    @app.get("/concurrency")
    def concurrency_endpoint():
        return {"message": "test"}
    
    import threading
    
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
    assert response.status_code == 200
    assert response.json()["message"] == "test"
    assert response.headers["X-Content-Type-Options"] == "nosniff" 