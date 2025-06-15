import pytest
from fastapi import status
import os
import json
import logging
from app.logger import setup_logger

def test_logger_setup():
    # Test logger setup
    logger = setup_logger("test")
    assert isinstance(logger, logging.Logger)
    assert logger.name == "test"
    assert logger.level == logging.INFO
    assert len(logger.handlers) == 2  # File and console handlers

def test_log_file_creation():
    # Test log file creation
    logger = setup_logger("test")
    logger.info("Test log message")
    
    # Verify log file exists
    assert os.path.exists("logs/test.log")
    
    # Verify log file content
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test log message" in content

def test_log_rotation():
    # Test log rotation
    logger = setup_logger("test")
    
    # Generate enough logs to trigger rotation
    for i in range(1000):
        logger.info("x" * 1000)  # 1KB per log
    
    # Verify log files
    assert os.path.exists("logs/test.log")
    assert os.path.exists("logs/test.log.1")
    assert os.path.exists("logs/test.log.2")
    assert os.path.exists("logs/test.log.3")
    assert os.path.exists("logs/test.log.4")
    assert os.path.exists("logs/test.log.5")
    assert not os.path.exists("logs/test.log.6")

def test_log_levels():
    # Test different log levels
    logger = setup_logger("test")
    
    # Test debug level
    logger.debug("Debug message")
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Debug message" not in content  # Debug messages should not be logged
    
    # Test info level
    logger.info("Info message")
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Info message" in content
    
    # Test warning level
    logger.warning("Warning message")
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Warning message" in content
    
    # Test error level
    logger.error("Error message")
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Error message" in content
    
    # Test critical level
    logger.critical("Critical message")
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Critical message" in content

def test_log_format():
    # Test log format
    logger = setup_logger("test")
    logger.info("Test log message")
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "INFO" in content
        assert "test" in content
        assert "Test log message" in content
        assert ":" in content  # Time format

def test_multiple_loggers():
    # Test multiple loggers
    logger1 = setup_logger("test1")
    logger2 = setup_logger("test2")
    
    logger1.info("Test1 message")
    logger2.info("Test2 message")
    
    # Verify log files
    assert os.path.exists("logs/test1.log")
    assert os.path.exists("logs/test2.log")
    
    # Verify log content
    with open("logs/test1.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test1 message" in content
        assert "Test2 message" not in content
    
    with open("logs/test2.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test2 message" in content
        assert "Test1 message" not in content

def test_log_exception():
    # Test logging exceptions
    logger = setup_logger("test")
    
    try:
        raise ValueError("Test exception")
    except Exception as e:
        logger.exception("Exception occurred")
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Exception occurred" in content
        assert "ValueError: Test exception" in content
        assert "Traceback" in content

def test_log_context():
    # Test logging with context
    logger = setup_logger("test")
    
    logger.info("Test message", extra={
        "user_id": "123",
        "action": "test"
    })
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test message" in content
        assert "user_id=123" in content
        assert "action=test" in content

def test_log_cleanup():
    # Test log cleanup
    logger = setup_logger("test")
    
    # Generate some logs
    for i in range(100):
        logger.info(f"Test message {i}")
    
    # Clean up old logs
    logger.handlers[0].doRollover()
    
    # Verify log files
    assert os.path.exists("logs/test.log")
    assert os.path.exists("logs/test.log.1")

def test_log_permissions():
    # Test log file permissions
    logger = setup_logger("test")
    logger.info("Test message")
    
    # Verify log file permissions
    assert os.access("logs/test.log", os.R_OK)
    assert os.access("logs/test.log", os.W_OK)

def test_log_directory_creation():
    # Test log directory creation
    if os.path.exists("logs"):
        os.rmdir("logs")
    
    logger = setup_logger("test")
    logger.info("Test message")
    
    assert os.path.exists("logs")
    assert os.path.isdir("logs")

def test_log_console_output(capsys):
    # Test console output
    logger = setup_logger("test")
    logger.info("Test message")
    
    captured = capsys.readouterr()
    assert "Test message" in captured.out

def test_log_file_output():
    # Test file output
    logger = setup_logger("test")
    logger.info("Test message")
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test message" in content

def test_log_unicode():
    # Test unicode logging
    logger = setup_logger("test")
    logger.info("Test message 测试")
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test message 测试" in content

def test_log_json():
    # Test JSON logging
    logger = setup_logger("test")
    logger.info("Test message", extra={
        "data": {
            "key": "value",
            "number": 123,
            "boolean": True,
            "array": [1, 2, 3]
        }
    })
    
    with open("logs/test.log", "r", encoding="utf-8") as f:
        content = f.read()
        assert "Test message" in content
        assert "key=value" in content
        assert "number=123" in content
        assert "boolean=True" in content
        assert "array=[1, 2, 3]" in content 