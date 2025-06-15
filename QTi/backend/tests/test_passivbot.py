import pytest
from fastapi import status
import os
import json

def test_get_passivbot_version(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/version")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "version" in data
    assert "commit" in data
    assert "branch" in data

def test_get_passivbot_version_unauthorized(client):
    response = client.get("/api/v1/passivbot/version")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_passivbot_config(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/config")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "config" in data
    assert isinstance(data["config"], dict)

def test_get_passivbot_config_unauthorized(client):
    response = client.get("/api/v1/passivbot/config")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_passivbot_config(authorized_client):
    config = {
        "exchange": "binance",
        "symbol": "BTCUSDT",
        "leverage": 1,
        "position_mode": "one-way",
        "strategy": "grid",
        "grid_size": 10,
        "grid_spacing": 100
    }
    
    response = authorized_client.put(
        "/api/v1/passivbot/config",
        json={"config": config}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["config"] == config

def test_update_passivbot_config_unauthorized(client):
    config = {
        "exchange": "binance",
        "symbol": "BTCUSDT",
        "leverage": 1,
        "position_mode": "one-way",
        "strategy": "grid",
        "grid_size": 10,
        "grid_spacing": 100
    }
    
    response = client.put(
        "/api/v1/passivbot/config",
        json={"config": config}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_start_passivbot(authorized_client):
    response = authorized_client.post("/api/v1/passivbot/start")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "message" in data

def test_start_passivbot_unauthorized(client):
    response = client.post("/api/v1/passivbot/start")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_stop_passivbot(authorized_client):
    # Start the bot first
    authorized_client.post("/api/v1/passivbot/start")
    
    response = authorized_client.post("/api/v1/passivbot/stop")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "message" in data

def test_stop_passivbot_unauthorized(client):
    response = client.post("/api/v1/passivbot/stop")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_passivbot_status(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/status")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "uptime" in data
    assert "last_update" in data
    assert "position" in data
    assert "pnl" in data
    assert "balance" in data

def test_get_passivbot_status_unauthorized(client):
    response = client.get("/api/v1/passivbot/status")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_passivbot_logs(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)

def test_get_passivbot_logs_unauthorized(client):
    response = client.get("/api/v1/passivbot/logs")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_passivbot_logs_with_limit(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs?limit=10")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)
    assert len(data["logs"]) <= 10

def test_get_passivbot_logs_with_level(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs?level=ERROR")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)
    for log in data["logs"]:
        assert log["level"] == "ERROR"

def test_get_passivbot_logs_with_search(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs?search=error")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)
    for log in data["logs"]:
        assert "error" in log["message"].lower()

def test_get_passivbot_logs_with_date_range(authorized_client):
    response = authorized_client.get(
        "/api/v1/passivbot/logs",
        params={
            "start_date": "2023-01-01T00:00:00Z",
            "end_date": "2023-12-31T23:59:59Z"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "logs" in data
    assert isinstance(data["logs"], list)
    for log in data["logs"]:
        assert "2023-01-01T00:00:00Z" <= log["timestamp"] <= "2023-12-31T23:59:59Z"

def test_get_passivbot_logs_with_invalid_date_range(authorized_client):
    response = authorized_client.get(
        "/api/v1/passivbot/logs",
        params={
            "start_date": "2023-12-31T23:59:59Z",
            "end_date": "2023-01-01T00:00:00Z"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_passivbot_logs_with_invalid_level(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs?level=INVALID")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_passivbot_logs_with_invalid_limit(authorized_client):
    response = authorized_client.get("/api/v1/passivbot/logs?limit=-1")
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 