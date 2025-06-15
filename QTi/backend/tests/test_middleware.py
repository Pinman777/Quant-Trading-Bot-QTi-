import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from app.middleware import (
    RequestLoggingMiddleware,
    ErrorHandlingMiddleware,
    SecurityMiddleware,
    setup_middleware
)
import json
import time

@pytest.fixture
def app():
    app = FastAPI()
    setup_middleware(app)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_request_logging_middleware(client):
    # Test request logging
    @client.app.get("/test")
    async def test_endpoint():
        return {"message": "test"}
    
    response = client.get("/test")
    assert response.status_code == 200
    assert response.json() == {"message": "test"}

def test_error_handling_middleware(client):
    # Test error handling
    @client.app.get("/error")
    async def error_endpoint():
        raise Exception("Test error")
    
    response = client.get("/error")
    assert response.status_code == 500
    assert response.json() == {
        "detail": "Internal server error",
        "status_code": 500
    }

def test_security_middleware(client):
    # Test security headers
    response = client.get("/")
    assert response.status_code == 404
    
    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Strict-Transport-Security") == "max-age=31536000; includeSubDomains"
    assert headers.get("Content-Security-Policy") is not None
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("Permissions-Policy") is not None

def test_cors_middleware(client):
    # Test CORS headers
    response = client.options("/")
    assert response.status_code == 404
    
    headers = response.headers
    assert headers.get("Access-Control-Allow-Origin") is not None
    assert headers.get("Access-Control-Allow-Methods") is not None
    assert headers.get("Access-Control-Allow-Headers") is not None
    assert headers.get("Access-Control-Allow-Credentials") == "true"
    assert headers.get("Access-Control-Max-Age") is not None

def test_gzip_middleware(client):
    # Test Gzip compression
    @client.app.get("/large")
    async def large_endpoint():
        return {"data": "x" * 1000}
    
    response = client.get("/large", headers={"Accept-Encoding": "gzip"})
    assert response.status_code == 200
    assert response.headers.get("Content-Encoding") == "gzip"

def test_session_middleware(client):
    # Test session handling
    @client.app.get("/session")
    async def session_endpoint(request: Request):
        return {"session": request.session.get("test", None)}
    
    response = client.get("/session")
    assert response.status_code == 200
    assert response.json() == {"session": None}
    
    # Test setting session
    @client.app.post("/session")
    async def set_session_endpoint(request: Request):
        request.session["test"] = "value"
        return {"message": "Session set"}
    
    response = client.post("/session")
    assert response.status_code == 200
    assert response.json() == {"message": "Session set"}
    
    # Test getting session
    response = client.get("/session")
    assert response.status_code == 200
    assert response.json() == {"session": "value"}

def test_request_timing(client):
    # Test request timing
    @client.app.get("/slow")
    async def slow_endpoint():
        time.sleep(0.1)
        return {"message": "slow"}
    
    start_time = time.time()
    response = client.get("/slow")
    end_time = time.time()
    
    assert response.status_code == 200
    assert response.json() == {"message": "slow"}
    assert end_time - start_time >= 0.1

def test_error_details(client):
    # Test error details
    @client.app.get("/detailed-error")
    async def detailed_error_endpoint():
        raise ValueError("Detailed error message")
    
    response = client.get("/detailed-error")
    assert response.status_code == 500
    assert response.json() == {
        "detail": "Internal server error",
        "status_code": 500
    }

def test_custom_error_handling(client):
    # Test custom error handling
    @client.app.exception_handler(ValueError)
    async def value_error_handler(request, exc):
        return {
            "detail": str(exc),
            "status_code": 400
        }
    
    @client.app.get("/custom-error")
    async def custom_error_endpoint():
        raise ValueError("Custom error message")
    
    response = client.get("/custom-error")
    assert response.status_code == 400
    assert response.json() == {
        "detail": "Custom error message",
        "status_code": 400
    }

def test_request_body_logging(client):
    # Test request body logging
    @client.app.post("/body")
    async def body_endpoint(request: Request):
        body = await request.json()
        return {"received": body}
    
    test_data = {"test": "data"}
    response = client.post("/body", json=test_data)
    assert response.status_code == 200
    assert response.json() == {"received": test_data}

def test_response_body_logging(client):
    # Test response body logging
    @client.app.get("/response")
    async def response_endpoint():
        return {"test": "response"}
    
    response = client.get("/response")
    assert response.status_code == 200
    assert response.json() == {"test": "response"}

def test_middleware_order(client):
    # Test middleware order
    @client.app.get("/order")
    async def order_endpoint():
        return {"message": "test"}
    
    response = client.get("/order")
    assert response.status_code == 200
    
    # Verify headers are set in correct order
    headers = response.headers
    assert headers.get("X-Content-Type-Options") is not None
    assert headers.get("Content-Encoding") is not None
    assert headers.get("Access-Control-Allow-Origin") is not None

def test_middleware_performance(client):
    # Test middleware performance
    @client.app.get("/performance")
    async def performance_endpoint():
        return {"message": "test"}
    
    start_time = time.time()
    for _ in range(100):
        response = client.get("/performance")
        assert response.status_code == 200
    end_time = time.time()
    
    # Verify that middleware doesn't add significant overhead
    assert end_time - start_time < 1.0  # Should complete within 1 second

def test_middleware_error_recovery(client):
    # Test middleware error recovery
    @client.app.get("/recovery")
    async def recovery_endpoint():
        raise Exception("Test error")
    
    response = client.get("/recovery")
    assert response.status_code == 500
    
    # Verify that subsequent requests still work
    response = client.get("/")
    assert response.status_code == 404

def test_middleware_cleanup(client):
    # Test middleware cleanup
    @client.app.get("/cleanup")
    async def cleanup_endpoint():
        return {"message": "test"}
    
    response = client.get("/cleanup")
    assert response.status_code == 200
    
    # Verify that resources are properly cleaned up
    assert not hasattr(response, "_content")
    assert not hasattr(response, "_headers")

def test_middleware_configuration(client):
    # Test middleware configuration
    @client.app.get("/config")
    async def config_endpoint():
        return {"message": "test"}
    
    response = client.get("/config")
    assert response.status_code == 200
    
    # Verify that middleware is configured correctly
    headers = response.headers
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert headers.get("X-Frame-Options") == "DENY"
    assert headers.get("X-XSS-Protection") == "1; mode=block"
    assert headers.get("Strict-Transport-Security") == "max-age=31536000; includeSubDomains"
    assert headers.get("Content-Security-Policy") is not None
    assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert headers.get("Permissions-Policy") is not None

def test_middleware_customization(client):
    # Test middleware customization
    @client.app.get("/custom")
    async def custom_endpoint():
        return {"message": "test"}
    
    response = client.get("/custom")
    assert response.status_code == 200
    
    # Verify that middleware can be customized
    headers = response.headers
    assert headers.get("X-Custom-Header") is None  # Default behavior
    
    # Add custom header
    @client.app.middleware("http")
    async def add_custom_header(request, call_next):
        response = await call_next(request)
        response.headers["X-Custom-Header"] = "custom"
        return response
    
    response = client.get("/custom")
    assert response.status_code == 200
    assert response.headers.get("X-Custom-Header") == "custom"

def test_middleware_chain(client):
    # Test middleware chain
    @client.app.get("/chain")
    async def chain_endpoint():
        return {"message": "test"}
    
    # Add multiple middleware
    @client.app.middleware("http")
    async def middleware1(request, call_next):
        response = await call_next(request)
        response.headers["X-Middleware-1"] = "1"
        return response
    
    @client.app.middleware("http")
    async def middleware2(request, call_next):
        response = await call_next(request)
        response.headers["X-Middleware-2"] = "2"
        return response
    
    response = client.get("/chain")
    assert response.status_code == 200
    assert response.headers.get("X-Middleware-1") == "1"
    assert response.headers.get("X-Middleware-2") == "2"

def test_middleware_error_chain(client):
    # Test middleware error chain
    @client.app.get("/error-chain")
    async def error_chain_endpoint():
        raise Exception("Test error")
    
    # Add error handling middleware
    @client.app.middleware("http")
    async def error_middleware1(request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            return {"detail": str(e), "status_code": 500}
    
    @client.app.middleware("http")
    async def error_middleware2(request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            return {"detail": f"Error: {str(e)}", "status_code": 500}
    
    response = client.get("/error-chain")
    assert response.status_code == 500
    assert "Error: Test error" in response.json()["detail"]

def test_middleware_async(client):
    # Test async middleware
    @client.app.get("/async")
    async def async_endpoint():
        return {"message": "test"}
    
    # Add async middleware
    @client.app.middleware("http")
    async def async_middleware(request, call_next):
        # Simulate async operation
        await asyncio.sleep(0.1)
        response = await call_next(request)
        response.headers["X-Async"] = "true"
        return response
    
    response = client.get("/async")
    assert response.status_code == 200
    assert response.headers.get("X-Async") == "true"

def test_middleware_context(client):
    # Test middleware context
    @client.app.get("/context")
    async def context_endpoint():
        return {"message": "test"}
    
    # Add context middleware
    @client.app.middleware("http")
    async def context_middleware(request, call_next):
        request.state.context = {"test": "value"}
        response = await call_next(request)
        return response
    
    @client.app.get("/context-value")
    async def context_value_endpoint(request: Request):
        return {"context": request.state.context}
    
    response = client.get("/context-value")
    assert response.status_code == 200
    assert response.json() == {"context": {"test": "value"}}

def test_middleware_metrics(client):
    # Test middleware metrics
    @client.app.get("/metrics")
    async def metrics_endpoint():
        return {"message": "test"}
    
    # Add metrics middleware
    metrics = []
    
    @client.app.middleware("http")
    async def metrics_middleware(request, call_next):
        start_time = time.time()
        response = await call_next(request)
        end_time = time.time()
        metrics.append({
            "path": request.url.path,
            "method": request.method,
            "duration": end_time - start_time,
            "status_code": response.status_code
        })
        return response
    
    response = client.get("/metrics")
    assert response.status_code == 200
    assert len(metrics) == 1
    assert metrics[0]["path"] == "/metrics"
    assert metrics[0]["method"] == "GET"
    assert metrics[0]["status_code"] == 200
    assert metrics[0]["duration"] >= 0 