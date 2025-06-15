import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token
)
from app.core.config import settings
import jwt
from datetime import datetime, timedelta
import time

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_password_hashing():
    # Test password hashing
    password = "Test123!"
    hashed_password = get_password_hash(password)
    
    # Verify password
    assert verify_password(password, hashed_password)
    assert not verify_password("WrongPassword", hashed_password)
    
    # Test different passwords
    assert not verify_password("test123!", hashed_password)  # Different case
    assert not verify_password("Test123", hashed_password)  # Missing special character
    assert not verify_password("Test123!!", hashed_password)  # Extra character

def test_token_creation():
    # Test token creation
    username = "testuser"
    token = create_access_token(username)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == username
    assert payload["exp"] > time.time()

def test_token_expiration():
    # Test token expiration
    username = "testuser"
    expires_delta = timedelta(minutes=1)
    token = create_access_token(username, expires_delta)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == username
    
    # Wait for token to expire
    time.sleep(2)
    
    # Verify expired token
    with pytest.raises(Exception):
        verify_token(token)

def test_token_verification():
    # Test token verification
    username = "testuser"
    token = create_access_token(username)
    
    # Verify valid token
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == username
    
    # Verify invalid token
    with pytest.raises(Exception):
        verify_token("invalid_token")
    
    # Verify tampered token
    tampered_token = token[:-1] + "x"
    with pytest.raises(Exception):
        verify_token(tampered_token)

def test_token_payload():
    # Test token payload
    username = "testuser"
    is_admin = True
    token = create_access_token(username, is_admin=is_admin)
    
    # Verify payload
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == username
    assert payload["is_admin"] == is_admin

def test_password_strength():
    # Test password strength
    # Valid passwords
    valid_passwords = [
        "Test123!",
        "Complex1Password!",
        "P@ssw0rd123",
        "Str0ng!P@ss"
    ]
    
    for password in valid_passwords:
        hashed = get_password_hash(password)
        assert verify_password(password, hashed)
    
    # Invalid passwords
    invalid_passwords = [
        "weak",  # Too short
        "weakpassword",  # No uppercase
        "WEAKPASSWORD",  # No lowercase
        "WeakPassword",  # No numbers
        "Weak123"  # No special characters
    ]
    
    for password in invalid_passwords:
        with pytest.raises(ValueError):
            get_password_hash(password)

def test_token_security():
    # Test token security
    username = "testuser"
    token = create_access_token(username)
    
    # Test token format
    assert isinstance(token, str)
    assert len(token.split(".")) == 3  # JWT format
    
    # Test token algorithm
    header = jwt.get_unverified_header(token)
    assert header["alg"] == "HS256"
    
    # Test token signature
    with pytest.raises(Exception):
        jwt.decode(
            token,
            "wrong_secret",
            algorithms=["HS256"]
        )

def test_password_salt():
    # Test password salting
    password = "Test123!"
    hashed1 = get_password_hash(password)
    hashed2 = get_password_hash(password)
    
    # Same password should have different hashes
    assert hashed1 != hashed2
    
    # Both hashes should verify correctly
    assert verify_password(password, hashed1)
    assert verify_password(password, hashed2)

def test_token_claims():
    # Test token claims
    username = "testuser"
    token = create_access_token(username)
    
    # Verify claims
    payload = verify_token(token)
    assert "sub" in payload
    assert "exp" in payload
    assert "iat" in payload
    assert "is_admin" in payload

def test_token_refresh():
    # Test token refresh
    username = "testuser"
    token1 = create_access_token(username)
    time.sleep(1)  # Wait to ensure different timestamps
    token2 = create_access_token(username)
    
    # Tokens should be different
    assert token1 != token2
    
    # Both tokens should be valid
    payload1 = verify_token(token1)
    payload2 = verify_token(token2)
    assert payload1["sub"] == username
    assert payload2["sub"] == username

def test_password_validation():
    # Test password validation
    # Test minimum length
    with pytest.raises(ValueError):
        get_password_hash("aA1!")
    
    # Test maximum length
    with pytest.raises(ValueError):
        get_password_hash("a" * 129 + "A1!")
    
    # Test required character types
    with pytest.raises(ValueError):
        get_password_hash("password")  # No uppercase, numbers, or special chars
    
    with pytest.raises(ValueError):
        get_password_hash("PASSWORD")  # No lowercase, numbers, or special chars
    
    with pytest.raises(ValueError):
        get_password_hash("Password")  # No numbers or special chars
    
    with pytest.raises(ValueError):
        get_password_hash("Password1")  # No special chars

def test_token_blacklist():
    # Test token blacklist
    username = "testuser"
    token = create_access_token(username)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    
    # Blacklist token
    # Note: This would require implementing a token blacklist mechanism
    # For now, we'll just verify that the token is still valid
    payload = verify_token(token)
    assert payload is not None

def test_password_reset_token():
    # Test password reset token
    username = "testuser"
    token = create_access_token(username, is_reset=True)
    
    # Verify token
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == username
    assert payload["is_reset"] is True
    
    # Verify shorter expiration
    assert payload["exp"] < time.time() + 3600  # Should expire within 1 hour

def test_token_rotation():
    # Test token rotation
    username = "testuser"
    token1 = create_access_token(username)
    time.sleep(1)  # Wait to ensure different timestamps
    token2 = create_access_token(username)
    
    # Tokens should be different
    assert token1 != token2
    
    # Both tokens should be valid
    payload1 = verify_token(token1)
    payload2 = verify_token(token2)
    assert payload1["sub"] == username
    assert payload2["sub"] == username
    
    # Verify different timestamps
    assert payload1["iat"] != payload2["iat"] 