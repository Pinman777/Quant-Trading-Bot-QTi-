import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.core.config import Config
from app.core.config import settings
from app.core.auth import AuthService
from app.core.cache import CacheService
from app.core.logging import LoggingService
from app.core.migrations import MigrationService
from app.core.validation import ValidationService
import json
import os
import yaml
import time

@pytest.fixture
def app():
    app = FastAPI()
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def config():
    return Config()

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

def test_config_lifecycle(client, app, config, auth_service, cache_service, logging_service, migration_service, validation_service):
    # Test complete configuration lifecycle
    # Load configuration
    config.load()
    assert config.settings is not None
    
    # Get configuration
    settings = config.get_settings()
    assert settings is not None
    
    # Update configuration
    config.update({"new_setting": "value"})
    assert config.get("new_setting") == "value"
    
    # Save configuration
    config.save()
    assert os.path.exists(config.config_file)
    
    # Reload configuration
    config.reload()
    assert config.get("new_setting") == "value"

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

def test_config_validation(client, app, config):
    # Test configuration validation
    # Test required settings
    required_settings = [
        "API_V1_STR",
        "PROJECT_NAME",
        "SECRET_KEY",
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "DATABASE_URL"
    ]
    
    for setting in required_settings:
        assert config.get(setting) is not None
    
    # Test setting types
    assert isinstance(config.get("API_V1_STR"), str)
    assert isinstance(config.get("PROJECT_NAME"), str)
    assert isinstance(config.get("SECRET_KEY"), str)
    assert isinstance(config.get("ACCESS_TOKEN_EXPIRE_MINUTES"), int)
    assert isinstance(config.get("DATABASE_URL"), str)
    
    # Test setting ranges
    assert config.get("ACCESS_TOKEN_EXPIRE_MINUTES") > 0
    assert config.get("ACCESS_TOKEN_EXPIRE_MINUTES") <= 1440
    
    # Test setting formats
    assert config.get("DATABASE_URL").startswith(("sqlite:///", "postgresql://", "mysql://"))

def test_config_operations(client, app, config):
    # Test configuration operations
    # Get setting
    assert config.get("API_V1_STR") == "/api/v1"
    
    # Set setting
    config.set("test_setting", "value")
    assert config.get("test_setting") == "value"
    
    # Delete setting
    config.delete("test_setting")
    assert config.get("test_setting") is None
    
    # Get all settings
    settings = config.get_all()
    assert isinstance(settings, dict)
    assert "API_V1_STR" in settings
    assert "PROJECT_NAME" in settings
    
    # Get settings by prefix
    api_settings = config.get_by_prefix("API_")
    assert isinstance(api_settings, dict)
    assert "API_V1_STR" in api_settings

def test_config_export(client, app, config):
    # Test configuration export
    # Export as JSON
    json_config = config.export_json()
    assert json_config is not None
    assert isinstance(json_config, str)
    assert json.loads(json_config) is not None
    
    # Export as YAML
    yaml_config = config.export_yaml()
    assert yaml_config is not None
    assert isinstance(yaml_config, str)
    assert yaml.safe_load(yaml_config) is not None
    
    # Export as environment variables
    env_config = config.export_env()
    assert env_config is not None
    assert isinstance(env_config, str)
    assert "API_V1_STR=" in env_config
    assert "PROJECT_NAME=" in env_config
    
    # Export as Python
    py_config = config.export_python()
    assert py_config is not None
    assert isinstance(py_config, str)
    assert "API_V1_STR =" in py_config
    assert "PROJECT_NAME =" in py_config

def test_config_import(client, app, config):
    # Test configuration import
    # Import from JSON
    json_config = {
        "API_V1_STR": "/api/v2",
        "PROJECT_NAME": "Test Project"
    }
    config.import_json(json.dumps(json_config))
    assert config.get("API_V1_STR") == "/api/v2"
    assert config.get("PROJECT_NAME") == "Test Project"
    
    # Import from YAML
    yaml_config = """
    API_V1_STR: /api/v3
    PROJECT_NAME: Test Project 2
    """
    config.import_yaml(yaml_config)
    assert config.get("API_V1_STR") == "/api/v3"
    assert config.get("PROJECT_NAME") == "Test Project 2"
    
    # Import from environment variables
    os.environ["API_V1_STR"] = "/api/v4"
    os.environ["PROJECT_NAME"] = "Test Project 3"
    config.import_env()
    assert config.get("API_V1_STR") == "/api/v4"
    assert config.get("PROJECT_NAME") == "Test Project 3"
    
    # Import from Python
    py_config = """
    API_V1_STR = "/api/v5"
    PROJECT_NAME = "Test Project 4"
    """
    config.import_python(py_config)
    assert config.get("API_V1_STR") == "/api/v5"
    assert config.get("PROJECT_NAME") == "Test Project 4"

def test_config_validation(client, app, config):
    # Test configuration validation
    # Test invalid setting
    with pytest.raises(Exception):
        config.get("invalid_setting")
    
    # Test invalid type
    with pytest.raises(Exception):
        config.set("API_V1_STR", 123)
    
    # Test invalid range
    with pytest.raises(Exception):
        config.set("ACCESS_TOKEN_EXPIRE_MINUTES", -1)
    
    # Test invalid format
    with pytest.raises(Exception):
        config.set("DATABASE_URL", "invalid_url")
    
    # Test invalid JSON
    with pytest.raises(Exception):
        config.import_json("invalid_json")
    
    # Test invalid YAML
    with pytest.raises(Exception):
        config.import_yaml("invalid_yaml")
    
    # Test invalid Python
    with pytest.raises(Exception):
        config.import_python("invalid_python")

def test_config_security(client, app, config):
    # Test configuration security
    # Test sensitive data masking
    config.set("SECRET_KEY", "secret123")
    masked_config = config.export_json()
    assert "secret123" not in masked_config
    
    # Test SQL injection prevention
    config.set("DATABASE_URL", "'; DROP TABLE users; --")
    assert config.get("DATABASE_URL") != "'; DROP TABLE users; --"
    
    # Test XSS prevention
    config.set("PROJECT_NAME", "<script>alert('test')</script>")
    assert config.get("PROJECT_NAME") != "<script>alert('test')</script>"
    
    # Test file path sanitization
    config.set("LOG_FILE", "../../../etc/passwd")
    assert config.get("LOG_FILE") != "../../../etc/passwd"

def test_config_performance(client, app, config):
    # Test configuration performance
    # Test get performance
    start_time = time.time()
    for _ in range(1000):
        config.get("API_V1_STR")
    get_time = time.time() - start_time
    assert get_time < 1.0  # Should be fast
    
    # Test set performance
    start_time = time.time()
    for _ in range(1000):
        config.set("test_setting", "value")
    set_time = time.time() - start_time
    assert set_time < 1.0  # Should be fast
    
    # Test export performance
    start_time = time.time()
    for _ in range(1000):
        config.export_json()
    export_time = time.time() - start_time
    assert export_time < 1.0  # Should be fast

def test_config_concurrency(client, app, config):
    # Test configuration concurrency
    import threading
    
    def get_settings():
        for _ in range(100):
            config.get("API_V1_STR")
    
    def set_settings():
        for _ in range(100):
            config.set("test_setting", "value")
    
    def export_settings():
        for _ in range(100):
            config.export_json()
    
    # Create threads
    threads = []
    for _ in range(10):
        threads.append(threading.Thread(target=get_settings))
        threads.append(threading.Thread(target=set_settings))
        threads.append(threading.Thread(target=export_settings))
    
    # Start threads
    for thread in threads:
        thread.start()
    
    # Wait for threads
    for thread in threads:
        thread.join()
    
    # Verify results
    assert config.get("API_V1_STR") == "/api/v1"
    assert config.get("test_setting") == "value"
    assert config.export_json() is not None

def test_config_services(client, app, auth_service, cache_service, logging_service, migration_service, validation_service):
    # Test config services
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

def test_config_api(client, app, auth_service):
    # Test config API
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

def test_config_database(client, app, migration_service):
    # Test config database
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

def test_config_security(client, app, auth_service):
    # Test config security
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

def test_config_performance(client, app, auth_service, cache_service, logging_service):
    # Test config performance
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

def test_config_concurrency(client, app, auth_service, cache_service, logging_service):
    # Test config concurrency
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

def test_config_error_handling(client, app, auth_service, cache_service, logging_service):
    # Test config error handling
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

def test_config_validation(client, app, validation_service):
    # Test config validation
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