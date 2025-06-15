import pytest
from fastapi import status
from app.schemas.auth import UserCreate

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "another@example.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "anotheruser",
            "email": "test@example.com",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(authorized_client, test_user):
    response = authorized_client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert "id" in data
    assert "hashed_password" not in data

def test_get_current_user_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_refresh_token(authorized_client):
    response = authorized_client.post("/api/v1/auth/refresh")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_refresh_token_unauthorized(client):
    response = client.post("/api/v1/auth/refresh")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_logout(authorized_client):
    response = authorized_client.post("/api/v1/auth/logout")
    assert response.status_code == status.HTTP_200_OK

def test_logout_unauthorized(client):
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED 