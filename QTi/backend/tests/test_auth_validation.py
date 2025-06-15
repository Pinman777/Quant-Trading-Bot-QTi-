import pytest
from pydantic import ValidationError
from app.schemas.auth import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenData,
    PasswordReset,
    PasswordResetConfirm
)

def test_user_base_validation():
    # Test UserBase validation
    # Valid data
    valid_data = {
        "username": "testuser",
        "email": "test@example.com"
    }
    user = UserBase(**valid_data)
    assert user.username == valid_data["username"]
    assert user.email == valid_data["email"]
    
    # Invalid username
    with pytest.raises(ValidationError):
        UserBase(username="te", email="test@example.com")
    
    with pytest.raises(ValidationError):
        UserBase(username="test" * 10, email="test@example.com")
    
    with pytest.raises(ValidationError):
        UserBase(username="test user", email="test@example.com")
    
    # Invalid email
    with pytest.raises(ValidationError):
        UserBase(username="testuser", email="invalid-email")
    
    with pytest.raises(ValidationError):
        UserBase(username="testuser", email="@example.com")
    
    with pytest.raises(ValidationError):
        UserBase(username="testuser", email="test@")

def test_user_create_validation():
    # Test UserCreate validation
    # Valid data
    valid_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    user = UserCreate(**valid_data)
    assert user.username == valid_data["username"]
    assert user.email == valid_data["email"]
    assert user.password == valid_data["password"]
    
    # Invalid password
    with pytest.raises(ValidationError):
        UserCreate(
            username="testuser",
            email="test@example.com",
            password="weak"  # Too short
        )
    
    with pytest.raises(ValidationError):
        UserCreate(
            username="testuser",
            email="test@example.com",
            password="weakpassword"  # No uppercase
        )
    
    with pytest.raises(ValidationError):
        UserCreate(
            username="testuser",
            email="test@example.com",
            password="WEAKPASSWORD"  # No lowercase
        )
    
    with pytest.raises(ValidationError):
        UserCreate(
            username="testuser",
            email="test@example.com",
            password="WeakPassword"  # No numbers
        )
    
    with pytest.raises(ValidationError):
        UserCreate(
            username="testuser",
            email="test@example.com",
            password="Weak123"  # No special characters
        )

def test_user_update_validation():
    # Test UserUpdate validation
    # Valid data
    valid_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!"
    }
    user = UserUpdate(**valid_data)
    assert user.username == valid_data["username"]
    assert user.email == valid_data["email"]
    assert user.password == valid_data["password"]
    
    # Partial update
    partial_data = {
        "username": "newusername"
    }
    user = UserUpdate(**partial_data)
    assert user.username == partial_data["username"]
    assert user.email is None
    assert user.password is None
    
    # Invalid data
    with pytest.raises(ValidationError):
        UserUpdate(username="te", email="test@example.com")
    
    with pytest.raises(ValidationError):
        UserUpdate(username="testuser", email="invalid-email")
    
    with pytest.raises(ValidationError):
        UserUpdate(password="weak")

def test_user_response_validation():
    # Test UserResponse validation
    # Valid data
    valid_data = {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00"
    }
    user = UserResponse(**valid_data)
    assert user.id == valid_data["id"]
    assert user.username == valid_data["username"]
    assert user.email == valid_data["email"]
    assert user.is_active == valid_data["is_active"]
    assert user.created_at == valid_data["created_at"]
    
    # Invalid data
    with pytest.raises(ValidationError):
        UserResponse(
            id="invalid",  # Should be integer
            username="testuser",
            email="test@example.com",
            is_active=True,
            created_at="2024-01-01T00:00:00"
        )
    
    with pytest.raises(ValidationError):
        UserResponse(
            id=1,
            username="te",  # Too short
            email="test@example.com",
            is_active=True,
            created_at="2024-01-01T00:00:00"
        )
    
    with pytest.raises(ValidationError):
        UserResponse(
            id=1,
            username="testuser",
            email="invalid-email",
            is_active=True,
            created_at="2024-01-01T00:00:00"
        )

def test_token_validation():
    # Test Token validation
    # Valid data
    valid_data = {
        "access_token": "valid_token",
        "token_type": "bearer"
    }
    token = Token(**valid_data)
    assert token.access_token == valid_data["access_token"]
    assert token.token_type == valid_data["token_type"]
    
    # Invalid data
    with pytest.raises(ValidationError):
        Token(access_token="", token_type="bearer")
    
    with pytest.raises(ValidationError):
        Token(access_token="valid_token", token_type="invalid")

def test_token_data_validation():
    # Test TokenData validation
    # Valid data
    valid_data = {
        "username": "testuser"
    }
    token_data = TokenData(**valid_data)
    assert token_data.username == valid_data["username"]
    
    # Empty data
    token_data = TokenData()
    assert token_data.username is None

def test_password_reset_validation():
    # Test PasswordReset validation
    # Valid data
    valid_data = {
        "email": "test@example.com"
    }
    reset = PasswordReset(**valid_data)
    assert reset.email == valid_data["email"]
    
    # Invalid data
    with pytest.raises(ValidationError):
        PasswordReset(email="invalid-email")
    
    with pytest.raises(ValidationError):
        PasswordReset(email="@example.com")
    
    with pytest.raises(ValidationError):
        PasswordReset(email="test@")

def test_password_reset_confirm_validation():
    # Test PasswordResetConfirm validation
    # Valid data
    valid_data = {
        "token": "valid_token",
        "new_password": "Test123!"
    }
    confirm = PasswordResetConfirm(**valid_data)
    assert confirm.token == valid_data["token"]
    assert confirm.new_password == valid_data["new_password"]
    
    # Invalid data
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="",
            new_password="Test123!"
        )
    
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="valid_token",
            new_password="weak"  # Too short
        )
    
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="valid_token",
            new_password="weakpassword"  # No uppercase
        )
    
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="valid_token",
            new_password="WEAKPASSWORD"  # No lowercase
        )
    
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="valid_token",
            new_password="WeakPassword"  # No numbers
        )
    
    with pytest.raises(ValidationError):
        PasswordResetConfirm(
            token="valid_token",
            new_password="Weak123"  # No special characters
        ) 