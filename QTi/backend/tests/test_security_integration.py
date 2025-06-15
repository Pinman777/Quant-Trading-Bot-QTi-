import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.security import Security
from app.core.config import settings
import json
import os
import jwt
from datetime import datetime, timedelta

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def security():
    return Security()

def test_security_lifecycle(client, security):
    # Test complete security lifecycle
    # Generate token
    token = security.generate_token({"sub": "test_user"})
    assert token is not None
    
    # Verify token
    payload = security.verify_token(token)
    assert payload["sub"] == "test_user"
    
    # Refresh token
    new_token = security.refresh_token(token)
    assert new_token is not None
    assert new_token != token
    
    # Verify new token
    payload = security.verify_token(new_token)
    assert payload["sub"] == "test_user"

def test_token_operations(client, security):
    # Test token operations
    # Generate token with expiration
    token = security.generate_token(
        {"sub": "test_user"},
        expires_delta=timedelta(minutes=1)
    )
    assert token is not None
    
    # Verify token
    payload = security.verify_token(token)
    assert payload["sub"] == "test_user"
    assert "exp" in payload
    
    # Generate token with custom claims
    token = security.generate_token(
        {"sub": "test_user", "role": "admin"},
        expires_delta=timedelta(minutes=1)
    )
    assert token is not None
    
    # Verify token with custom claims
    payload = security.verify_token(token)
    assert payload["sub"] == "test_user"
    assert payload["role"] == "admin"
    
    # Generate token with audience
    token = security.generate_token(
        {"sub": "test_user"},
        audience="test_audience"
    )
    assert token is not None
    
    # Verify token with audience
    payload = security.verify_token(token, audience="test_audience")
    assert payload["sub"] == "test_user"
    assert payload["aud"] == "test_audience"

def test_password_operations(client, security):
    # Test password operations
    # Hash password
    password = "test_password"
    hashed_password = security.hash_password(password)
    assert hashed_password is not None
    assert hashed_password != password
    
    # Verify password
    assert security.verify_password(password, hashed_password)
    assert not security.verify_password("wrong_password", hashed_password)
    
    # Hash password with custom salt
    salt = os.urandom(16)
    hashed_password = security.hash_password(password, salt=salt)
    assert hashed_password is not None
    assert hashed_password != password
    
    # Verify password with custom salt
    assert security.verify_password(password, hashed_password, salt=salt)
    assert not security.verify_password("wrong_password", hashed_password, salt=salt)

def test_encryption_operations(client, security):
    # Test encryption operations
    # Encrypt data
    data = "test_data"
    encrypted_data = security.encrypt_data(data)
    assert encrypted_data is not None
    assert encrypted_data != data
    
    # Decrypt data
    decrypted_data = security.decrypt_data(encrypted_data)
    assert decrypted_data == data
    
    # Encrypt data with custom key
    key = os.urandom(32)
    encrypted_data = security.encrypt_data(data, key=key)
    assert encrypted_data is not None
    assert encrypted_data != data
    
    # Decrypt data with custom key
    decrypted_data = security.decrypt_data(encrypted_data, key=key)
    assert decrypted_data == data

def test_validation_operations(client, security):
    # Test validation operations
    # Validate email
    assert security.validate_email("test@example.com")
    assert not security.validate_email("invalid_email")
    
    # Validate password
    assert security.validate_password("Test123!")
    assert not security.validate_password("weak")
    
    # Validate username
    assert security.validate_username("test_user")
    assert not security.validate_username("invalid username")
    
    # Validate token
    token = security.generate_token({"sub": "test_user"})
    assert security.validate_token(token)
    assert not security.validate_token("invalid_token")

def test_rate_limiting(client, security):
    # Test rate limiting
    # Test IP rate limiting
    ip = "127.0.0.1"
    for _ in range(100):
        security.check_rate_limit(ip)
    
    with pytest.raises(Exception):
        security.check_rate_limit(ip)
    
    # Test user rate limiting
    user_id = "test_user"
    for _ in range(100):
        security.check_user_rate_limit(user_id)
    
    with pytest.raises(Exception):
        security.check_user_rate_limit(user_id)
    
    # Test endpoint rate limiting
    endpoint = "/api/test"
    for _ in range(100):
        security.check_endpoint_rate_limit(endpoint)
    
    with pytest.raises(Exception):
        security.check_endpoint_rate_limit(endpoint)

def test_cors_operations(client, security):
    # Test CORS operations
    # Test allowed origins
    assert security.is_allowed_origin("http://localhost:3000")
    assert not security.is_allowed_origin("http://malicious.com")
    
    # Test allowed methods
    assert security.is_allowed_method("GET")
    assert security.is_allowed_method("POST")
    assert not security.is_allowed_method("PUT")
    
    # Test allowed headers
    assert security.is_allowed_header("Content-Type")
    assert security.is_allowed_header("Authorization")
    assert not security.is_allowed_header("X-Malicious")

def test_sanitization_operations(client, security):
    # Test sanitization operations
    # Test input sanitization
    input_data = "<script>alert('test')</script>"
    sanitized_data = security.sanitize_input(input_data)
    assert sanitized_data == "&lt;script&gt;alert('test')&lt;/script&gt;"
    
    # Test output sanitization
    output_data = "&lt;script&gt;alert('test')&lt;/script&gt;"
    sanitized_data = security.sanitize_output(output_data)
    assert sanitized_data == "<script>alert('test')</script>"
    
    # Test SQL injection prevention
    sql_input = "'; DROP TABLE users; --"
    sanitized_data = security.sanitize_sql(sql_input)
    assert sanitized_data == "''; DROP TABLE users; --"
    
    # Test XSS prevention
    xss_input = "<img src=x onerror=alert('test')>"
    sanitized_data = security.sanitize_xss(xss_input)
    assert sanitized_data == "&lt;img src=x onerror=alert('test')&gt;"

def test_error_handling(client, security):
    # Test error handling
    # Test invalid token
    with pytest.raises(Exception):
        security.verify_token("invalid_token")
    
    # Test expired token
    token = security.generate_token(
        {"sub": "test_user"},
        expires_delta=timedelta(seconds=-1)
    )
    with pytest.raises(Exception):
        security.verify_token(token)
    
    # Test invalid password
    with pytest.raises(Exception):
        security.verify_password("password", "invalid_hash")
    
    # Test invalid encryption
    with pytest.raises(Exception):
        security.decrypt_data("invalid_data")
    
    # Test invalid validation
    with pytest.raises(Exception):
        security.validate_email(123)
    
    # Test invalid rate limiting
    with pytest.raises(Exception):
        security.check_rate_limit(None)
    
    # Test invalid CORS
    with pytest.raises(Exception):
        security.is_allowed_origin(None)
    
    # Test invalid sanitization
    with pytest.raises(Exception):
        security.sanitize_input(None)

def test_security_performance(client, security):
    # Test security performance
    # Test token generation performance
    start_time = time.time()
    for _ in range(1000):
        security.generate_token({"sub": "test_user"})
    token_time = time.time() - start_time
    assert token_time < 1.0  # Should be fast
    
    # Test password hashing performance
    start_time = time.time()
    for _ in range(1000):
        security.hash_password("test_password")
    hash_time = time.time() - start_time
    assert hash_time < 1.0  # Should be fast
    
    # Test encryption performance
    start_time = time.time()
    for _ in range(1000):
        security.encrypt_data("test_data")
    encrypt_time = time.time() - start_time
    assert encrypt_time < 1.0  # Should be fast
    
    # Test validation performance
    start_time = time.time()
    for _ in range(1000):
        security.validate_email("test@example.com")
    validate_time = time.time() - start_time
    assert validate_time < 1.0  # Should be fast

def test_security_concurrency(client, security):
    # Test security concurrency
    import threading
    
    def generate_tokens():
        for _ in range(100):
            security.generate_token({"sub": "test_user"})
    
    def hash_passwords():
        for _ in range(100):
            security.hash_password("test_password")
    
    def encrypt_data():
        for _ in range(100):
            security.encrypt_data("test_data")
    
    # Create threads
    threads = []
    for _ in range(10):
        threads.append(threading.Thread(target=generate_tokens))
        threads.append(threading.Thread(target=hash_passwords))
        threads.append(threading.Thread(target=encrypt_data))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    token = security.generate_token({"sub": "test_user"})
    assert security.verify_token(token)["sub"] == "test_user"
    
    hashed_password = security.hash_password("test_password")
    assert security.verify_password("test_password", hashed_password)
    
    encrypted_data = security.encrypt_data("test_data")
    assert security.decrypt_data(encrypted_data) == "test_data" 