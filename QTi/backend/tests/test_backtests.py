import pytest
from fastapi import status

def test_create_backtest(authorized_client):
    response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Backtest"
    assert data["config"]["exchange"] == "binance"
    assert data["config"]["symbol"] == "BTCUSDT"
    assert data["config"]["timeframe"] == "1h"
    assert "id" in data
    assert "owner_id" in data
    assert "created_at" in data

def test_create_backtest_unauthorized(client):
    response = client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_backtests(authorized_client):
    # Create a backtest first
    authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    
    response = authorized_client.get("/api/v1/backtests")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["name"] == "Test Backtest"

def test_get_backtest(authorized_client):
    # Create a backtest first
    create_response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    backtest_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/backtests/{backtest_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Backtest"
    assert data["id"] == backtest_id

def test_get_nonexistent_backtest(authorized_client):
    response = authorized_client.get("/api/v1/backtests/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_backtest(authorized_client):
    # Create a backtest first
    create_response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    backtest_id = create_response.json()["id"]
    
    response = authorized_client.delete(f"/api/v1/backtests/{backtest_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify backtest is deleted
    get_response = authorized_client.get(f"/api/v1/backtests/{backtest_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_get_backtest_results(authorized_client):
    # Create a backtest first
    create_response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    backtest_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/backtests/{backtest_id}/results")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_return" in data
    assert "sharpe_ratio" in data
    assert "max_drawdown" in data
    assert "win_rate" in data
    assert "trades" in data
    assert "equity_curve" in data

def test_get_backtest_results_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/backtests/999/results")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_get_backtest_trades(authorized_client):
    # Create a backtest first
    create_response = authorized_client.post(
        "/api/v1/backtests",
        json={
            "name": "Test Backtest",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": 1,
                    "position_mode": "one-way",
                    "grid_size": 10,
                    "grid_spacing": 100
                }
            }
        }
    )
    backtest_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/backtests/{backtest_id}/trades")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "timestamp" in data[0]
        assert "type" in data[0]
        assert "price" in data[0]
        assert "size" in data[0]
        assert "pnl" in data[0]

def test_get_backtest_trades_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/backtests/999/trades")
    assert response.status_code == status.HTTP_404_NOT_FOUND 