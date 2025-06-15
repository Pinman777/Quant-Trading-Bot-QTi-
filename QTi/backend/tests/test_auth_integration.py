import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.auth import AuthService
from app.core.config import settings
from app.core.exceptions import AuthenticationError
import json
import time
import jwt
from app.core.cache import CacheService
from app.core.logging import LoggingService
from app.core.migrations import MigrationService
from app.core.validation import ValidationService
import os

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def auth_service():
    return AuthService()

@pytest.fixture
def cache_service():
    return CacheService()

@pytest.fixture
def logging_service():
    return LoggingService()

@pytest.fixture
def migration_service():
    return MigrationService()

@pytest.fixture
def validation_service():
    return ValidationService()

def test_auth_lifecycle(client, app, auth_service, cache_service, logging_service, migration_service, validation_service):
    # Test complete auth lifecycle
    # Initialize services
    auth_service.init()
    cache_service.init()
    logging_service.init()
    migration_service.init()
    
    # Register user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    
    # Login user
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Set cache
    cache_service.set("test_key", "test_value")
    assert cache_service.exists("test_key")
    
    # Log message
    logging_service.info("Test message")
    logs = logging_service.get_logs()
    assert len(logs) > 0
    
    # Run migration
    migration_service.upgrade()
    status = migration_service.status()
    assert status["current"] is not None
    
    # Validate data
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    result = validation_service.validate_user_data(data)
    assert result is True

def test_auth_services(client, app, auth_service, cache_service, logging_service, migration_service, validation_service):
    # Test auth services
    # Test auth service
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    auth_service.create_user(user_data)
    user = auth_service.get_user_by_username(user_data["username"])
    assert user is not None
    assert user["username"] == user_data["username"]
    
    # Test cache service
    cache_service.set("test_key", "test_value")
    value = cache_service.get("test_key")
    assert value == "test_value"
    
    # Test logging service
    logging_service.info("Test message")
    logs = logging_service.get_logs()
    assert len(logs) > 0
    assert "Test message" in logs[0]["message"]
    
    # Test migration service
    migration_service.upgrade()
    status = migration_service.status()
    assert status["current"] is not None
    
    # Test validation service
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    result = validation_service.validate_user_data(data)
    assert result is True

def test_auth_api(client, app, auth_service):
    # Test auth API
    # Register user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    
    # Login user
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Get user info
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == user_data["username"]
    
    # Refresh token
    response = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Logout user
    response = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_auth_database(client, app, migration_service):
    # Test auth database
    # Run migrations
    migration_service.upgrade()
    status = migration_service.status()
    assert status["current"] is not None
    
    # Create table
    migration = migration_service.create("create_test_table")
    with open(migration, "w") as f:
        f.write("""
def upgrade():
    op.create_table(
        'test_table',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('test_table')
        """)
    
    # Run migration
    migration_service.upgrade()
    
    # Check table
    response = client.get("/api/v1/test")
    assert response.status_code == 200
    
    # Drop table
    migration_service.downgrade()
    
    # Check table
    response = client.get("/api/v1/test")
    assert response.status_code == 404

def test_auth_security(client, app, auth_service):
    # Test auth security
    # Test SQL injection
    user_data = {
        "username": "testuser'; DROP TABLE users; --",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test XSS
    user_data = {
        "username": "<script>alert('test')</script>",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test path traversal
    response = client.get("/api/v1/files/../../../etc/passwd")
    assert response.status_code == 404
    
    # Test authentication
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_auth_performance(client, app, auth_service, cache_service, logging_service):
    # Test auth performance
    # Test auth performance
    start_time = time.time()
    for i in range(100):
        user_data = {
            "username": f"testuser{i}",
            "email": f"test{i}@example.com",
            "password": "Test123!@#"
        }
        auth_service.create_user(user_data)
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast
    
    # Test cache performance
    start_time = time.time()
    for i in range(1000):
        cache_service.set(f"key_{i}", f"value_{i}")
    end_time = time.time()
    assert end_time - start_time < 1.0  # Should be fast
    
    # Test logging performance
    start_time = time.time()
    for i in range(1000):
        logging_service.info(f"Test message {i}")
    end_time = time.time()
    assert end_time - start_time < 1.0  # Should be fast

def test_auth_concurrency(client, app, auth_service, cache_service, logging_service):
    # Test auth concurrency
    import threading
    
    def create_user(i):
        user_data = {
            "username": f"testuser{i}",
            "email": f"test{i}@example.com",
            "password": "Test123!@#"
        }
        auth_service.create_user(user_data)
    
    def set_cache(i):
        for j in range(100):
            cache_service.set(f"key_{i}_{j}", f"value_{i}_{j}")
    
    def log_message(i):
        for j in range(100):
            logging_service.info(f"Test message {i}_{j}")
    
    # Create threads
    threads = []
    for i in range(10):
        threads.append(threading.Thread(target=create_user, args=(i,)))
        threads.append(threading.Thread(target=set_cache, args=(i,)))
        threads.append(threading.Thread(target=log_message, args=(i,)))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    user = auth_service.get_user_by_username("testuser0")
    assert user is not None
    assert cache_service.exists("key_0_0")
    logs = logging_service.get_logs()
    assert len(logs) > 0

def test_auth_error_handling(client, app, auth_service, cache_service, logging_service):
    # Test auth error handling
    # Test auth errors
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "weak"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test cache errors
    with pytest.raises(ValueError):
        cache_service.set(None, "value")
    
    # Test logging errors
    with pytest.raises(ValueError):
        logging_service.info(None)
    
    # Test API errors
    response = client.get("/api/v1/invalid")
    assert response.status_code == 404

def test_auth_validation(client, app, validation_service):
    # Test auth validation
    # Test user validation
    user_data = {
        "username": "te",  # Too short
        "email": "invalid-email",
        "password": "weak"
    }
    with pytest.raises(Exception):
        validation_service.validate_user_data(user_data)
    
    # Test email validation
    with pytest.raises(Exception):
        validation_service.validate_email("invalid-email")
    
    # Test password validation
    with pytest.raises(Exception):
        validation_service.validate_password("weak")
    
    # Test API validation
    response = client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422

def test_auth_registration(client, app, auth_service):
    # Test user registration
    # Test valid registration
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    assert response.json()["username"] == user_data["username"]
    
    # Test duplicate username
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test duplicate email
    user_data["username"] = "testuser2"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test invalid password
    user_data["password"] = "weak"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test invalid email
    user_data["email"] = "invalid-email"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400

def test_auth_login(client, app, auth_service):
    # Test user login
    # Register user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Test valid login
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Test invalid password
    login_data["password"] = "wrong"
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    
    # Test invalid username
    login_data["username"] = "wrong"
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401

def test_auth_token(client, app, auth_service):
    # Test token operations
    # Register and login user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    client.post("/api/v1/auth/register", json=user_data)
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["access_token"]
    
    # Test token validation
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    
    # Test token refresh
    response = client.post("/api/v1/auth/refresh", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Test expired token
    expired_token = auth_service.create_access_token({"sub": user_data["username"]}, expires_delta=-1)
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
    
    # Test invalid token
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401

def test_auth_password(client, app, auth_service):
    # Test password operations
    # Register user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Test password verification
    assert auth_service.verify_password(user_data["password"], auth_service.get_password_hash(user_data["password"]))
    
    # Test password update
    new_password = "NewTest123!@#"
    response = client.post("/api/v1/auth/update-password", json={
        "current_password": user_data["password"],
        "new_password": new_password
    })
    assert response.status_code == 200
    
    # Test login with new password
    login_data = {
        "username": user_data["username"],
        "password": new_password
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    
    # Test password reset
    response = client.post("/api/v1/auth/reset-password", json={"email": user_data["email"]})
    assert response.status_code == 200
    
    # Test password reset confirmation
    reset_token = "test-reset-token"  # In real app, this would be generated
    response = client.post("/api/v1/auth/reset-password-confirm", json={
        "token": reset_token,
        "new_password": "ResetTest123!@#"
    })
    assert response.status_code == 200

def test_auth_validation(client, app, auth_service):
    # Test authentication validation
    # Test username validation
    user_data = {
        "username": "a",  # Too short
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test email validation
    user_data["username"] = "testuser"
    user_data["email"] = "invalid-email"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test password validation
    user_data["email"] = "test@example.com"
    user_data["password"] = "weak"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test token validation
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401

def test_auth_error_handling(client, app, auth_service):
    # Test authentication error handling
    # Test registration errors
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Test duplicate registration
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test login errors
    login_data = {
        "username": "testuser",
        "password": "wrong"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401
    
    # Test token errors
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 401
    
    # Test password reset errors
    response = client.post("/api/v1/auth/reset-password", json={"email": "nonexistent@example.com"})
    assert response.status_code == 404

def test_auth_security(client, app, auth_service):
    # Test authentication security
    # Test password hashing
    password = "Test123!@#"
    hashed = auth_service.get_password_hash(password)
    assert hashed != password
    assert auth_service.verify_password(password, hashed)
    
    # Test token security
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@#"
    }
    client.post("/api/v1/auth/register", json=user_data)
    login_data = {
        "username": user_data["username"],
        "password": user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["access_token"]
    
    # Test token tampering
    tampered_token = token[:-1] + "X"
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert response.status_code == 401
    
    # Test SQL injection prevention
    user_data["username"] = "testuser'; DROP TABLE users; --"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    
    # Test XSS prevention
    user_data["username"] = "<script>alert('test')</script>"
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400

def test_auth_performance(client, app, auth_service):
    # Test authentication performance
    # Test registration performance
    start_time = time.time()
    for i in range(100):
        user_data = {
            "username": f"testuser{i}",
            "email": f"test{i}@example.com",
            "password": "Test123!@#"
        }
        client.post("/api/v1/auth/register", json=user_data)
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast
    
    # Test login performance
    start_time = time.time()
    for i in range(100):
        login_data = {
            "username": f"testuser{i}",
            "password": "Test123!@#"
        }
        client.post("/api/v1/auth/login", json=login_data)
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast
    
    # Test token validation performance
    login_data = {
        "username": "testuser0",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    token = response.json()["access_token"]
    
    start_time = time.time()
    for _ in range(1000):
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    end_time = time.time()
    assert end_time - start_time < 10.0  # Should be reasonably fast

def test_auth_concurrency(client, app, auth_service):
    # Test authentication concurrency
    import threading
    
    def register_user(i):
        user_data = {
            "username": f"testuser{i}",
            "email": f"test{i}@example.com",
            "password": "Test123!@#"
        }
        client.post("/api/v1/auth/register", json=user_data)
    
    def login_user(i):
        login_data = {
            "username": f"testuser{i}",
            "password": "Test123!@#"
        }
        client.post("/api/v1/auth/login", json=login_data)
    
    # Create threads
    threads = []
    for i in range(10):
        threads.append(threading.Thread(target=register_user, args=(i,)))
        threads.append(threading.Thread(target=login_user, args=(i,)))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    login_data = {
        "username": "testuser0",
        "password": "Test123!@#"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json() 