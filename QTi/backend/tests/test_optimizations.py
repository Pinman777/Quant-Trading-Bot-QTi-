import pytest
from fastapi import status

def test_create_optimization(authorized_client):
    response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Optimization"
    assert data["config"]["exchange"] == "binance"
    assert data["config"]["symbol"] == "BTCUSDT"
    assert data["config"]["timeframe"] == "1h"
    assert "id" in data
    assert "owner_id" in data
    assert "created_at" in data

def test_create_optimization_unauthorized(client):
    response = client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_optimizations(authorized_client):
    # Create an optimization first
    authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    
    response = authorized_client.get("/api/v1/optimizations")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["name"] == "Test Optimization"

def test_get_optimization(authorized_client):
    # Create an optimization first
    create_response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    optimization_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/optimizations/{optimization_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Optimization"
    assert data["id"] == optimization_id

def test_get_nonexistent_optimization(authorized_client):
    response = authorized_client.get("/api/v1/optimizations/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_optimization(authorized_client):
    # Create an optimization first
    create_response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    optimization_id = create_response.json()["id"]
    
    response = authorized_client.delete(f"/api/v1/optimizations/{optimization_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify optimization is deleted
    get_response = authorized_client.get(f"/api/v1/optimizations/{optimization_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_get_optimization_results(authorized_client):
    # Create an optimization first
    create_response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    optimization_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/optimizations/{optimization_id}/results")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "best_parameters" in data
    assert "best_score" in data
    assert "all_results" in data
    assert "parameter_importance" in data
    assert "constraint_violations" in data

def test_get_optimization_results_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/optimizations/999/results")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_get_optimization_progress(authorized_client):
    # Create an optimization first
    create_response = authorized_client.post(
        "/api/v1/optimizations",
        json={
            "name": "Test Optimization",
            "config": {
                "exchange": "binance",
                "symbol": "BTCUSDT",
                "timeframe": "1h",
                "start_date": "2023-01-01T00:00:00Z",
                "end_date": "2023-12-31T23:59:59Z",
                "strategy": "grid",
                "parameters": {
                    "leverage": [1, 2, 3],
                    "position_mode": ["one-way"],
                    "grid_size": [5, 10, 15],
                    "grid_spacing": [50, 100, 150]
                },
                "optimization_target": "sharpe_ratio",
                "constraints": {
                    "max_drawdown": 0.2,
                    "min_trades": 100
                }
            }
        }
    )
    optimization_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/optimizations/{optimization_id}/progress")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "progress" in data
    assert "current_iteration" in data
    assert "total_iterations" in data
    assert "best_score" in data
    assert "best_parameters" in data

def test_get_optimization_progress_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/optimizations/999/progress")
    assert response.status_code == status.HTTP_404_NOT_FOUND 