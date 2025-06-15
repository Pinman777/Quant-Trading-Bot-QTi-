import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.auth import router as auth_router
from app.schemas.auth import UserCreate, UserResponse, Token
from app.core.config import settings
import jwt
from datetime import datetime, timedelta

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(auth_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_register_user(client):
    # Test user registration
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert "id" in data
    assert "created_at" in data

def test_register_duplicate_username(client):
    # Test registration with duplicate username
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # First registration
    client.post("/api/auth/register", json=user_data)
    
    # Second registration with same username
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]

def test_register_duplicate_email(client):
    # Test registration with duplicate email
    user_data1 = {
        "username": "testuser1",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    user_data2 = {
        "username": "testuser2",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # First registration
    client.post("/api/auth/register", json=user_data1)
    
    # Second registration with same email
    response = client.post("/api/auth/register", json=user_data2)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client):
    # Test successful login
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    # Test login with invalid credentials
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

def test_get_current_user(client):
    # Test getting current user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    login_response = client.post("/api/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # Get current user
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]

def test_get_current_user_unauthorized(client):
    # Test getting current user without token
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_get_current_user_invalid_token(client):
    # Test getting current user with invalid token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_refresh_token(client):
    # Test token refresh
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    login_response = client.post("/api/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # Refresh token
    response = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["access_token"] != token

def test_refresh_token_unauthorized(client):
    # Test token refresh without token
    response = client.post("/api/auth/refresh")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_refresh_token_invalid_token(client):
    # Test token refresh with invalid token
    response = client.post(
        "/api/auth/refresh",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_logout(client):
    # Test logout
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    
    login_response = client.post("/api/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # Logout
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Successfully logged out"}

def test_logout_unauthorized(client):
    # Test logout without token
    response = client.post("/api/auth/logout")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_logout_invalid_token(client):
    # Test logout with invalid token
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]

def test_password_reset_request(client):
    # Test password reset request
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Request password reset
    reset_data = {"email": user_data["email"]}
    response = client.post("/api/auth/password-reset", json=reset_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Password reset email sent"}

def test_password_reset_request_invalid_email(client):
    # Test password reset request with invalid email
    reset_data = {"email": "nonexistent@example.com"}
    response = client.post("/api/auth/password-reset", json=reset_data)
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_password_reset_confirm(client):
    # Test password reset confirmation
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    
    # Register user
    client.post("/api/auth/register", json=user_data)
    
    # Request password reset
    reset_data = {"email": user_data["email"]}
    client.post("/api/auth/password-reset", json=reset_data)
    
    # Confirm password reset
    confirm_data = {
        "token": "valid_reset_token",  # This would be generated in a real scenario
        "new_password": "NewTest123!"
    }
    
    response = client.post("/api/auth/password-reset/confirm", json=confirm_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Password successfully reset"}

def test_password_reset_confirm_invalid_token(client):
    # Test password reset confirmation with invalid token
    confirm_data = {
        "token": "invalid_token",
        "new_password": "NewTest123!"
    }
    
    response = client.post("/api/auth/password-reset/confirm", json=confirm_data)
    assert response.status_code == 400
    assert "Invalid or expired token" in response.json()["detail"] 