import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.server import router as server_router
from app.services.server_service import ServerService
from app.schemas.server import ServerCreate, ServerUpdate, ServerResponse
from app.core.config import settings
import json
import os

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(server_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def server_service():
    return ServerService()

@pytest.fixture
def test_server_data():
    return {
        "name": "Test Server",
        "host": "localhost",
        "port": 22,
        "username": "test_user",
        "password": "test_password",
        "type": "linux"
    }

def test_server_lifecycle(client, server_service, test_server_data):
    # Test complete server lifecycle
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    assert response.status_code == 200
    server_id = response.json()["id"]
    
    # Get server
    response = client.get(f"/api/servers/{server_id}")
    assert response.status_code == 200
    assert response.json()["name"] == test_server_data["name"]
    
    # Update server
    update_data = {
        "name": "Updated Server",
        "host": "new_host",
        "port": 2222,
        "username": "new_user",
        "password": "new_password",
        "type": "linux"
    }
    
    response = client.put(f"/api/servers/{server_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    
    # Test connection
    response = client.post(f"/api/servers/{server_id}/test")
    assert response.status_code == 200
    assert response.json()["status"] == "connected"
    
    # Get server status
    response = client.get(f"/api/servers/{server_id}/status")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "uptime" in response.json()
    
    # Delete server
    response = client.delete(f"/api/servers/{server_id}")
    assert response.status_code == 200

def test_server_validation(client, server_service):
    # Test server validation
    # Test invalid host
    invalid_data = {
        "name": "Test Server",
        "host": "invalid_host",
        "port": 22,
        "username": "test_user",
        "password": "test_password",
        "type": "linux"
    }
    
    response = client.post("/api/servers", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid port
    invalid_data["host"] = "localhost"
    invalid_data["port"] = 70000  # Invalid port
    
    response = client.post("/api/servers", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid type
    invalid_data["port"] = 22
    invalid_data["type"] = "invalid_type"
    
    response = client.post("/api/servers", json=invalid_data)
    assert response.status_code == 422

def test_server_operations(client, server_service, test_server_data):
    # Test server operations
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    server_id = response.json()["id"]
    
    # Test connection
    response = client.post(f"/api/servers/{server_id}/test")
    assert response.status_code == 200
    assert response.json()["status"] == "connected"
    
    # Get server info
    response = client.get(f"/api/servers/{server_id}/info")
    assert response.status_code == 200
    assert "os" in response.json()
    assert "cpu" in response.json()
    assert "memory" in response.json()
    assert "disk" in response.json()
    
    # Get server logs
    response = client.get(f"/api/servers/{server_id}/logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Get server metrics
    response = client.get(f"/api/servers/{server_id}/metrics")
    assert response.status_code == 200
    assert "cpu_usage" in response.json()
    assert "memory_usage" in response.json()
    assert "disk_usage" in response.json()
    assert "network" in response.json()

def test_server_backup_restore(client, server_service, test_server_data):
    # Test server backup and restore
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    server_id = response.json()["id"]
    
    # Create backup
    response = client.post(f"/api/servers/{server_id}/backup")
    assert response.status_code == 200
    backup_id = response.json()["id"]
    
    # Get backup
    response = client.get(f"/api/servers/{server_id}/backups/{backup_id}")
    assert response.status_code == 200
    assert "config" in response.json()
    assert "created_at" in response.json()
    
    # List backups
    response = client.get(f"/api/servers/{server_id}/backups")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Restore backup
    response = client.post(f"/api/servers/{server_id}/restore/{backup_id}")
    assert response.status_code == 200
    assert response.json()["config"] == test_server_data

def test_server_scheduling(client, server_service, test_server_data):
    # Test server scheduling
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    server_id = response.json()["id"]
    
    # Schedule server
    schedule_data = {
        "start_time": "09:00",
        "end_time": "17:00",
        "days": ["monday", "wednesday", "friday"]
    }
    
    response = client.post(f"/api/servers/{server_id}/schedule", json=schedule_data)
    assert response.status_code == 200
    assert response.json()["schedule"] == schedule_data
    
    # Get schedule
    response = client.get(f"/api/servers/{server_id}/schedule")
    assert response.status_code == 200
    assert response.json() == schedule_data
    
    # Update schedule
    new_schedule = {
        "start_time": "10:00",
        "end_time": "18:00",
        "days": ["tuesday", "thursday"]
    }
    
    response = client.put(f"/api/servers/{server_id}/schedule", json=new_schedule)
    assert response.status_code == 200
    assert response.json()["schedule"] == new_schedule
    
    # Delete schedule
    response = client.delete(f"/api/servers/{server_id}/schedule")
    assert response.status_code == 200

def test_server_notifications(client, server_service, test_server_data):
    # Test server notifications
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    server_id = response.json()["id"]
    
    # Set notification settings
    notification_data = {
        "email": "test@example.com",
        "telegram": "@test_bot",
        "events": ["status_change", "error", "alert"]
    }
    
    response = client.post(f"/api/servers/{server_id}/notifications", json=notification_data)
    assert response.status_code == 200
    assert response.json()["notifications"] == notification_data
    
    # Get notification settings
    response = client.get(f"/api/servers/{server_id}/notifications")
    assert response.status_code == 200
    assert response.json() == notification_data
    
    # Update notification settings
    new_notifications = {
        "email": "new@example.com",
        "telegram": "@new_bot",
        "events": ["status_change", "error"]
    }
    
    response = client.put(f"/api/servers/{server_id}/notifications", json=new_notifications)
    assert response.status_code == 200
    assert response.json()["notifications"] == new_notifications
    
    # Delete notification settings
    response = client.delete(f"/api/servers/{server_id}/notifications")
    assert response.status_code == 200

def test_server_error_handling(client, server_service):
    # Test server error handling
    # Test invalid server ID
    response = client.get("/api/servers/invalid_id")
    assert response.status_code == 404
    
    # Test duplicate server name
    server_data = {
        "name": "Test Server",
        "host": "localhost",
        "port": 22,
        "username": "test_user",
        "password": "test_password",
        "type": "linux"
    }
    
    client.post("/api/servers", json=server_data)
    response = client.post("/api/servers", json=server_data)
    assert response.status_code == 400
    
    # Test invalid operation
    response = client.post("/api/servers/123/invalid_operation")
    assert response.status_code == 404
    
    # Test invalid backup ID
    response = client.get("/api/servers/123/backups/invalid_id")
    assert response.status_code == 404
    
    # Test invalid schedule
    schedule_data = {
        "start_time": "invalid",
        "end_time": "invalid",
        "days": ["invalid_day"]
    }
    
    response = client.post("/api/servers/123/schedule", json=schedule_data)
    assert response.status_code == 422

def test_server_security(client, server_service, test_server_data):
    # Test server security
    # Create server
    response = client.post("/api/servers", json=test_server_data)
    server_id = response.json()["id"]
    
    # Test SSH key generation
    response = client.post(f"/api/servers/{server_id}/ssh-key")
    assert response.status_code == 200
    assert "public_key" in response.json()
    assert "private_key" in response.json()
    
    # Test SSH key update
    response = client.put(f"/api/servers/{server_id}/ssh-key")
    assert response.status_code == 200
    assert "public_key" in response.json()
    assert "private_key" in response.json()
    
    # Test SSH key deletion
    response = client.delete(f"/api/servers/{server_id}/ssh-key")
    assert response.status_code == 200
    
    # Test firewall rules
    firewall_data = {
        "rules": [
            {
                "port": 22,
                "protocol": "tcp",
                "action": "allow"
            },
            {
                "port": 80,
                "protocol": "tcp",
                "action": "allow"
            }
        ]
    }
    
    response = client.post(f"/api/servers/{server_id}/firewall", json=firewall_data)
    assert response.status_code == 200
    assert response.json()["firewall"] == firewall_data
    
    # Get firewall rules
    response = client.get(f"/api/servers/{server_id}/firewall")
    assert response.status_code == 200
    assert response.json() == firewall_data
    
    # Update firewall rules
    new_firewall = {
        "rules": [
            {
                "port": 22,
                "protocol": "tcp",
                "action": "allow"
            },
            {
                "port": 443,
                "protocol": "tcp",
                "action": "allow"
            }
        ]
    }
    
    response = client.put(f"/api/servers/{server_id}/firewall", json=new_firewall)
    assert response.status_code == 200
    assert response.json()["firewall"] == new_firewall
    
    # Delete firewall rules
    response = client.delete(f"/api/servers/{server_id}/firewall")
    assert response.status_code == 200 