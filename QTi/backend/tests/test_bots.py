import pytest
from fastapi import status

def test_create_bot(authorized_client):
    response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Bot"
    assert data["exchange"] == "binance"
    assert data["symbol"] == "BTCUSDT"
    assert data["config"]["leverage"] == 1
    assert data["config"]["position_mode"] == "one-way"
    assert data["config"]["strategy"] == "grid"
    assert "id" in data
    assert "owner_id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_create_bot_unauthorized(client):
    response = client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_bots(authorized_client):
    # Create a bot first
    authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    
    response = authorized_client.get("/api/v1/bots")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["name"] == "Test Bot"

def test_get_bot(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/bots/{bot_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Bot"
    assert data["id"] == bot_id

def test_get_nonexistent_bot(authorized_client):
    response = authorized_client.get("/api/v1/bots/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_bot(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    response = authorized_client.put(
        f"/api/v1/bots/{bot_id}",
        json={
            "name": "Updated Bot",
            "exchange": "binance",
            "symbol": "ETHUSDT",
            "config": {
                "leverage": 2,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Bot"
    assert data["symbol"] == "ETHUSDT"
    assert data["config"]["leverage"] == 2

def test_delete_bot(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    response = authorized_client.delete(f"/api/v1/bots/{bot_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify bot is deleted
    get_response = authorized_client.get(f"/api/v1/bots/{bot_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_start_bot(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    response = authorized_client.post(f"/api/v1/bots/{bot_id}/start")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "running"

def test_stop_bot(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    # Start the bot first
    authorized_client.post(f"/api/v1/bots/{bot_id}/start")
    
    response = authorized_client.post(f"/api/v1/bots/{bot_id}/stop")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "stopped"

def test_get_bot_stats(authorized_client):
    # Create a bot first
    create_response = authorized_client.post(
        "/api/v1/bots",
        json={
            "name": "Test Bot",
            "exchange": "binance",
            "symbol": "BTCUSDT",
            "config": {
                "leverage": 1,
                "position_mode": "one-way",
                "strategy": "grid"
            }
        }
    )
    bot_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/bots/{bot_id}/stats")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list) 