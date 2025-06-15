import pytest
from app.config import Settings
import os
from dotenv import load_dotenv

def test_settings_default_values():
    # Test default values
    settings = Settings()
    
    assert settings.API_V1_STR == "/api/v1"
    assert settings.PROJECT_NAME == "QTi"
    assert settings.SECRET_KEY is not None
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    assert settings.DATABASE_URL == "sqlite:///./qti.db"
    assert settings.LOG_LEVEL == "INFO"
    assert settings.LOG_FORMAT == "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    assert settings.CACHE_DURATION == 300
    assert settings.CACHE_SIZE == 1000
    assert settings.DEFAULT_LIMIT == 100
    assert settings.DEFAULT_OFFSET == 0

def test_settings_from_env():
    # Test loading from environment variables
    os.environ["SECRET_KEY"] = "test_secret"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["LOG_LEVEL"] = "DEBUG"
    
    settings = Settings()
    
    assert settings.SECRET_KEY == "test_secret"
    assert settings.DATABASE_URL == "sqlite:///./test.db"
    assert settings.LOG_LEVEL == "DEBUG"

def test_settings_from_dotenv():
    # Test loading from .env file
    with open(".env", "w") as f:
        f.write("SECRET_KEY=dotenv_secret\n")
        f.write("DATABASE_URL=sqlite:///./dotenv.db\n")
        f.write("LOG_LEVEL=WARNING\n")
    
    load_dotenv()
    settings = Settings()
    
    assert settings.SECRET_KEY == "dotenv_secret"
    assert settings.DATABASE_URL == "sqlite:///./dotenv.db"
    assert settings.LOG_LEVEL == "WARNING"
    
    os.remove(".env")

def test_settings_validation():
    # Test validation
    with pytest.raises(ValueError):
        Settings(ACCESS_TOKEN_EXPIRE_MINUTES=-1)
    
    with pytest.raises(ValueError):
        Settings(CACHE_DURATION=-1)
    
    with pytest.raises(ValueError):
        Settings(CACHE_SIZE=-1)
    
    with pytest.raises(ValueError):
        Settings(DEFAULT_LIMIT=-1)
    
    with pytest.raises(ValueError):
        Settings(DEFAULT_OFFSET=-1)

def test_settings_cors():
    # Test CORS settings
    settings = Settings()
    
    assert isinstance(settings.CORS_ORIGINS, list)
    assert "http://localhost:3000" in settings.CORS_ORIGINS
    assert "http://localhost:8000" in settings.CORS_ORIGINS

def test_settings_paths():
    # Test path settings
    settings = Settings()
    
    assert os.path.exists(settings.BOT_CONFIG_DIR)
    assert os.path.exists(settings.SERVER_CONFIG_DIR)
    assert os.path.exists(settings.LOG_DIR)

def test_settings_api():
    # Test API settings
    settings = Settings()
    
    assert settings.COINMARKETCAP_API_KEY is not None
    assert settings.RCLONE_CONFIG_PATH is not None

def test_settings_cache():
    # Test cache settings
    settings = Settings()
    
    assert settings.CACHE_DURATION > 0
    assert settings.CACHE_SIZE > 0
    assert settings.CACHE_ENABLED is True

def test_settings_database():
    # Test database settings
    settings = Settings()
    
    assert settings.DATABASE_URL.startswith("sqlite:///")
    assert settings.DATABASE_POOL_SIZE > 0
    assert settings.DATABASE_MAX_OVERFLOW > 0
    assert settings.DATABASE_ECHO is False

def test_settings_logging():
    # Test logging settings
    settings = Settings()
    
    assert settings.LOG_LEVEL in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    assert settings.LOG_FORMAT is not None
    assert settings.LOG_DIR is not None

def test_settings_security():
    # Test security settings
    settings = Settings()
    
    assert settings.SECRET_KEY is not None
    assert len(settings.SECRET_KEY) >= 32
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0

def test_settings_limits():
    # Test limit settings
    settings = Settings()
    
    assert settings.DEFAULT_LIMIT > 0
    assert settings.DEFAULT_OFFSET >= 0
    assert settings.MAX_LIMIT > settings.DEFAULT_LIMIT

def test_settings_directories():
    # Test directory settings
    settings = Settings()
    
    assert os.path.exists(settings.BOT_CONFIG_DIR)
    assert os.path.exists(settings.SERVER_CONFIG_DIR)
    assert os.path.exists(settings.LOG_DIR)
    assert os.path.exists(settings.CACHE_DIR)

def test_settings_file_permissions():
    # Test file permissions
    settings = Settings()
    
    assert os.access(settings.BOT_CONFIG_DIR, os.R_OK)
    assert os.access(settings.BOT_CONFIG_DIR, os.W_OK)
    assert os.access(settings.SERVER_CONFIG_DIR, os.R_OK)
    assert os.access(settings.SERVER_CONFIG_DIR, os.W_OK)
    assert os.access(settings.LOG_DIR, os.R_OK)
    assert os.access(settings.LOG_DIR, os.W_OK)
    assert os.access(settings.CACHE_DIR, os.R_OK)
    assert os.access(settings.CACHE_DIR, os.W_OK)

def test_settings_environment():
    # Test environment settings
    settings = Settings()
    
    assert settings.ENVIRONMENT in ["development", "testing", "production"]
    assert settings.DEBUG is not None
    assert settings.TESTING is not None

def test_settings_api_version():
    # Test API version settings
    settings = Settings()
    
    assert settings.API_V1_STR == "/api/v1"
    assert settings.API_V2_STR == "/api/v2"

def test_settings_project():
    # Test project settings
    settings = Settings()
    
    assert settings.PROJECT_NAME == "QTi"
    assert settings.PROJECT_VERSION is not None
    assert settings.PROJECT_DESCRIPTION is not None

def test_settings_validation_messages():
    # Test validation messages
    settings = Settings()
    
    assert settings.VALIDATION_MESSAGES is not None
    assert isinstance(settings.VALIDATION_MESSAGES, dict)
    assert len(settings.VALIDATION_MESSAGES) > 0

def test_settings_error_codes():
    # Test error codes
    settings = Settings()
    
    assert settings.ERROR_CODES is not None
    assert isinstance(settings.ERROR_CODES, dict)
    assert len(settings.ERROR_CODES) > 0

def test_settings_messages():
    # Test messages
    settings = Settings()
    
    assert settings.MESSAGES is not None
    assert isinstance(settings.MESSAGES, dict)
    assert len(settings.MESSAGES) > 0 