import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.config import settings

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db):
    from app.services.auth_service import AuthService
    from app.schemas.auth import UserCreate
    
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="Test123!@#"
    )
    
    auth_service = AuthService(db)
    user = auth_service.create_user(user_data)
    return user

@pytest.fixture(scope="function")
def test_user_token(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "Test123!@#"
        }
    )
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def authorized_client(client, test_user_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {test_user_token}"
    }
    return client 