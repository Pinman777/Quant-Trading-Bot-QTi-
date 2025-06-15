import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from app.dependencies.auth import (
    get_current_user,
    get_current_active_user,
    get_current_admin_user
)
from app.schemas.auth import UserResponse
from app.core.config import settings
import jwt
from datetime import datetime, timedelta

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def create_test_token(username: str, is_admin: bool = False) -> str:
    # Create a test JWT token
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": username,
        "exp": expire,
        "is_admin": is_admin
    }
    
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

def test_get_current_user():
    # Test getting current user from token
    username = "testuser"
    token = create_test_token(username)
    
    user = get_current_user(token)
    assert user is not None
    assert user.username == username

def test_get_current_user_invalid_token():
    # Test getting current user with invalid token
    with pytest.raises(Exception):
        get_current_user("invalid_token")

def test_get_current_user_expired_token():
    # Test getting current user with expired token
    expires_delta = timedelta(minutes=-1)  # Expired
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": "testuser",
        "exp": expire
    }
    
    token = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    
    with pytest.raises(Exception):
        get_current_user(token)

def test_get_current_active_user():
    # Test getting current active user
    username = "testuser"
    token = create_test_token(username)
    
    user = get_current_active_user(token)
    assert user is not None
    assert user.username == username
    assert user.is_active is True

def test_get_current_active_user_inactive():
    # Test getting inactive user
    username = "testuser"
    token = create_test_token(username)
    
    # Mock inactive user
    user = UserResponse(
        id=1,
        username=username,
        email="test@example.com",
        is_active=False,
        created_at="2024-01-01T00:00:00"
    )
    
    with pytest.raises(Exception):
        get_current_active_user(token, user)

def test_get_current_admin_user():
    # Test getting admin user
    username = "admin"
    token = create_test_token(username, is_admin=True)
    
    user = get_current_admin_user(token)
    assert user is not None
    assert user.username == username
    assert user.is_admin is True

def test_get_current_admin_user_non_admin():
    # Test getting non-admin user
    username = "testuser"
    token = create_test_token(username, is_admin=False)
    
    with pytest.raises(Exception):
        get_current_admin_user(token)

def test_dependency_injection(app, client):
    # Test dependency injection in FastAPI
    @app.get("/test")
    async def test_endpoint(current_user: UserResponse = Depends(get_current_user)):
        return {"username": current_user.username}
    
    # Test with valid token
    username = "testuser"
    token = create_test_token(username)
    
    response = client.get(
        "/test",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == username
    
    # Test without token
    response = client.get("/test")
    assert response.status_code == 401
    
    # Test with invalid token
    response = client.get(
        "/test",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401

def test_active_user_dependency(app, client):
    # Test active user dependency
    @app.get("/test-active")
    async def test_active_endpoint(
        current_user: UserResponse = Depends(get_current_active_user)
    ):
        return {"username": current_user.username}
    
    # Test with valid token
    username = "testuser"
    token = create_test_token(username)
    
    response = client.get(
        "/test-active",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == username
    
    # Test with inactive user
    # Mock inactive user
    user = UserResponse(
        id=1,
        username=username,
        email="test@example.com",
        is_active=False,
        created_at="2024-01-01T00:00:00"
    )
    
    response = client.get(
        "/test-active",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401

def test_admin_user_dependency(app, client):
    # Test admin user dependency
    @app.get("/test-admin")
    async def test_admin_endpoint(
        current_user: UserResponse = Depends(get_current_admin_user)
    ):
        return {"username": current_user.username}
    
    # Test with admin token
    username = "admin"
    token = create_test_token(username, is_admin=True)
    
    response = client.get(
        "/test-admin",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == username
    
    # Test with non-admin token
    username = "testuser"
    token = create_test_token(username, is_admin=False)
    
    response = client.get(
        "/test-admin",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401

def test_multiple_dependencies(app, client):
    # Test multiple dependencies
    @app.get("/test-multiple")
    async def test_multiple_endpoint(
        current_user: UserResponse = Depends(get_current_user),
        active_user: UserResponse = Depends(get_current_active_user),
        admin_user: UserResponse = Depends(get_current_admin_user)
    ):
        return {
            "username": current_user.username,
            "is_active": active_user.is_active,
            "is_admin": admin_user.is_admin
        }
    
    # Test with admin token
    username = "admin"
    token = create_test_token(username, is_admin=True)
    
    response = client.get(
        "/test-multiple",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == username
    assert data["is_active"] is True
    assert data["is_admin"] is True
    
    # Test with non-admin token
    username = "testuser"
    token = create_test_token(username, is_admin=False)
    
    response = client.get(
        "/test-multiple",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401

def test_dependency_caching(app, client):
    # Test dependency caching
    call_count = 0
    
    @app.get("/test-cache")
    async def test_cache_endpoint(
        current_user: UserResponse = Depends(get_current_user)
    ):
        nonlocal call_count
        call_count += 1
        return {"username": current_user.username, "call_count": call_count}
    
    # Test multiple calls with same token
    username = "testuser"
    token = create_test_token(username)
    
    response1 = client.get(
        "/test-cache",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response1.status_code == 200
    assert response1.json()["call_count"] == 1
    
    response2 = client.get(
        "/test-cache",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response2.status_code == 200
    assert response2.json()["call_count"] == 1  # Should be cached

def test_dependency_error_handling(app, client):
    # Test dependency error handling
    @app.get("/test-error")
    async def test_error_endpoint(
        current_user: UserResponse = Depends(get_current_user)
    ):
        return {"username": current_user.username}
    
    # Test with invalid token
    response = client.get(
        "/test-error",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]
    
    # Test with expired token
    expires_delta = timedelta(minutes=-1)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": "testuser",
        "exp": expire
    }
    
    token = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    
    response = client.get(
        "/test-error",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 401
    assert "Token has expired" in response.json()["detail"] 