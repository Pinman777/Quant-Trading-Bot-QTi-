import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.bot import router as bot_router
from app.services.bot_service import BotService
from app.schemas.bot import BotCreate, BotUpdate, BotResponse
from app.core.config import settings
import json
import os

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(bot_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def bot_service():
    return BotService()

@pytest.fixture
def test_config():
    return {
        "exchange": "binance",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "strategy": "grid",
        "parameters": {
            "grid_size": 10,
            "grid_spacing": 0.1,
            "position_size": 0.01
        }
    }

def test_bot_lifecycle(client, bot_service, test_config):
    # Test complete bot lifecycle
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 200
    bot_id = response.json()["id"]
    
    # Get bot
    response = client.get(f"/api/bots/{bot_id}")
    assert response.status_code == 200
    assert response.json()["name"] == bot_data["name"]
    
    # Update bot
    update_data = {
        "name": "Updated Bot",
        "config": {
            **test_config,
            "parameters": {
                "grid_size": 20,
                "grid_spacing": 0.2,
                "position_size": 0.02
            }
        }
    }
    
    response = client.put(f"/api/bots/{bot_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    
    # Start bot
    response = client.post(f"/api/bots/{bot_id}/start")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Get bot status
    response = client.get(f"/api/bots/{bot_id}/status")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "uptime" in response.json()
    
    # Stop bot
    response = client.post(f"/api/bots/{bot_id}/stop")
    assert response.status_code == 200
    assert response.json()["status"] == "stopped"
    
    # Delete bot
    response = client.delete(f"/api/bots/{bot_id}")
    assert response.status_code == 200

def test_bot_config_validation(client, bot_service):
    # Test bot configuration validation
    # Test invalid exchange
    invalid_config = {
        "exchange": "invalid_exchange",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "strategy": "grid",
        "parameters": {
            "grid_size": 10,
            "grid_spacing": 0.1,
            "position_size": 0.01
        }
    }
    
    bot_data = {
        "name": "Test Bot",
        "config": invalid_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 422
    
    # Test invalid symbol
    invalid_config["exchange"] = "binance"
    invalid_config["symbol"] = "INVALID"
    
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 422
    
    # Test invalid timeframe
    invalid_config["symbol"] = "BTCUSDT"
    invalid_config["timeframe"] = "invalid"
    
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 422
    
    # Test invalid strategy
    invalid_config["timeframe"] = "1h"
    invalid_config["strategy"] = "invalid"
    
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 422

def test_bot_operations(client, bot_service, test_config):
    # Test bot operations
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    bot_id = response.json()["id"]
    
    # Test pause/resume
    response = client.post(f"/api/bots/{bot_id}/pause")
    assert response.status_code == 200
    assert response.json()["status"] == "paused"
    
    response = client.post(f"/api/bots/{bot_id}/resume")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Test restart
    response = client.post(f"/api/bots/{bot_id}/restart")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Test config update
    new_config = {
        **test_config,
        "parameters": {
            "grid_size": 15,
            "grid_spacing": 0.15,
            "position_size": 0.015
        }
    }
    
    response = client.put(f"/api/bots/{bot_id}/config", json=new_config)
    assert response.status_code == 200
    assert response.json()["config"] == new_config

def test_bot_monitoring(client, bot_service, test_config):
    # Test bot monitoring
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    bot_id = response.json()["id"]
    
    # Start bot
    client.post(f"/api/bots/{bot_id}/start")
    
    # Get bot metrics
    response = client.get(f"/api/bots/{bot_id}/metrics")
    assert response.status_code == 200
    assert "performance" in response.json()
    assert "trades" in response.json()
    assert "balance" in response.json()
    
    # Get bot logs
    response = client.get(f"/api/bots/{bot_id}/logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Get bot alerts
    response = client.get(f"/api/bots/{bot_id}/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_bot_backup_restore(client, bot_service, test_config):
    # Test bot backup and restore
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    bot_id = response.json()["id"]
    
    # Create backup
    response = client.post(f"/api/bots/{bot_id}/backup")
    assert response.status_code == 200
    backup_id = response.json()["id"]
    
    # Get backup
    response = client.get(f"/api/bots/{bot_id}/backups/{backup_id}")
    assert response.status_code == 200
    assert "config" in response.json()
    assert "created_at" in response.json()
    
    # List backups
    response = client.get(f"/api/bots/{bot_id}/backups")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Restore backup
    response = client.post(f"/api/bots/{bot_id}/restore/{backup_id}")
    assert response.status_code == 200
    assert response.json()["config"] == test_config

def test_bot_scheduling(client, bot_service, test_config):
    # Test bot scheduling
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    bot_id = response.json()["id"]
    
    # Schedule bot
    schedule_data = {
        "start_time": "09:00",
        "end_time": "17:00",
        "days": ["monday", "wednesday", "friday"]
    }
    
    response = client.post(f"/api/bots/{bot_id}/schedule", json=schedule_data)
    assert response.status_code == 200
    assert response.json()["schedule"] == schedule_data
    
    # Get schedule
    response = client.get(f"/api/bots/{bot_id}/schedule")
    assert response.status_code == 200
    assert response.json() == schedule_data
    
    # Update schedule
    new_schedule = {
        "start_time": "10:00",
        "end_time": "18:00",
        "days": ["tuesday", "thursday"]
    }
    
    response = client.put(f"/api/bots/{bot_id}/schedule", json=new_schedule)
    assert response.status_code == 200
    assert response.json()["schedule"] == new_schedule
    
    # Delete schedule
    response = client.delete(f"/api/bots/{bot_id}/schedule")
    assert response.status_code == 200

def test_bot_notifications(client, bot_service, test_config):
    # Test bot notifications
    # Create bot
    bot_data = {
        "name": "Test Bot",
        "config": test_config
    }
    
    response = client.post("/api/bots", json=bot_data)
    bot_id = response.json()["id"]
    
    # Set notification settings
    notification_data = {
        "email": "test@example.com",
        "telegram": "@test_bot",
        "events": ["trade", "error", "alert"]
    }
    
    response = client.post(f"/api/bots/{bot_id}/notifications", json=notification_data)
    assert response.status_code == 200
    assert response.json()["notifications"] == notification_data
    
    # Get notification settings
    response = client.get(f"/api/bots/{bot_id}/notifications")
    assert response.status_code == 200
    assert response.json() == notification_data
    
    # Update notification settings
    new_notifications = {
        "email": "new@example.com",
        "telegram": "@new_bot",
        "events": ["trade", "error"]
    }
    
    response = client.put(f"/api/bots/{bot_id}/notifications", json=new_notifications)
    assert response.status_code == 200
    assert response.json()["notifications"] == new_notifications
    
    # Delete notification settings
    response = client.delete(f"/api/bots/{bot_id}/notifications")
    assert response.status_code == 200

def test_bot_error_handling(client, bot_service):
    # Test bot error handling
    # Test invalid bot ID
    response = client.get("/api/bots/invalid_id")
    assert response.status_code == 404
    
    # Test duplicate bot name
    bot_data = {
        "name": "Test Bot",
        "config": {
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "timeframe": "1h",
            "strategy": "grid",
            "parameters": {
                "grid_size": 10,
                "grid_spacing": 0.1,
                "position_size": 0.01
            }
        }
    }
    
    client.post("/api/bots", json=bot_data)
    response = client.post("/api/bots", json=bot_data)
    assert response.status_code == 400
    
    # Test invalid operation
    response = client.post("/api/bots/123/invalid_operation")
    assert response.status_code == 404
    
    # Test invalid backup ID
    response = client.get("/api/bots/123/backups/invalid_id")
    assert response.status_code == 404
    
    # Test invalid schedule
    schedule_data = {
        "start_time": "invalid",
        "end_time": "invalid",
        "days": ["invalid_day"]
    }
    
    response = client.post("/api/bots/123/schedule", json=schedule_data)
    assert response.status_code == 422 