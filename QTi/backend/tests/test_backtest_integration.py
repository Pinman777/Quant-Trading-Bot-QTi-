import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.backtest import router as backtest_router
from app.services.backtest_service import BacktestService
from app.schemas.backtest import BacktestCreate, BacktestUpdate, BacktestResponse
from app.core.config import settings
import json
import os

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(backtest_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def backtest_service():
    return BacktestService()

@pytest.fixture
def test_backtest_data():
    return {
        "name": "Test Backtest",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": 10,
            "grid_spacing": 0.1,
            "position_size": 0.01
        }
    }

def test_backtest_lifecycle(client, backtest_service, test_backtest_data):
    # Test complete backtest lifecycle
    # Create backtest
    response = client.post("/api/backtests", json=test_backtest_data)
    assert response.status_code == 200
    backtest_id = response.json()["id"]
    
    # Get backtest
    response = client.get(f"/api/backtests/{backtest_id}")
    assert response.status_code == 200
    assert response.json()["name"] == test_backtest_data["name"]
    
    # Update backtest
    update_data = {
        "name": "Updated Backtest",
        "symbol": "ETHUSDT",
        "timeframe": "4h",
        "start_date": "2023-02-01",
        "end_date": "2023-11-30",
        "strategy": "grid",
        "parameters": {
            "grid_size": 20,
            "grid_spacing": 0.2,
            "position_size": 0.02
        }
    }
    
    response = client.put(f"/api/backtests/{backtest_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    
    # Run backtest
    response = client.post(f"/api/backtests/{backtest_id}/run")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Get backtest status
    response = client.get(f"/api/backtests/{backtest_id}/status")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "progress" in response.json()
    
    # Get backtest results
    response = client.get(f"/api/backtests/{backtest_id}/results")
    assert response.status_code == 200
    assert "performance" in response.json()
    assert "trades" in response.json()
    assert "metrics" in response.json()
    
    # Delete backtest
    response = client.delete(f"/api/backtests/{backtest_id}")
    assert response.status_code == 200

def test_backtest_validation(client, backtest_service):
    # Test backtest validation
    # Test invalid symbol
    invalid_data = {
        "name": "Test Backtest",
        "symbol": "INVALID",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": 10,
            "grid_spacing": 0.1,
            "position_size": 0.01
        }
    }
    
    response = client.post("/api/backtests", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid timeframe
    invalid_data["symbol"] = "BTCUSDT"
    invalid_data["timeframe"] = "invalid"
    
    response = client.post("/api/backtests", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid dates
    invalid_data["timeframe"] = "1h"
    invalid_data["start_date"] = "2023-12-31"
    invalid_data["end_date"] = "2023-01-01"
    
    response = client.post("/api/backtests", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid strategy
    invalid_data["start_date"] = "2023-01-01"
    invalid_data["end_date"] = "2023-12-31"
    invalid_data["strategy"] = "invalid"
    
    response = client.post("/api/backtests", json=invalid_data)
    assert response.status_code == 422

def test_backtest_operations(client, backtest_service, test_backtest_data):
    # Test backtest operations
    # Create backtest
    response = client.post("/api/backtests", json=test_backtest_data)
    backtest_id = response.json()["id"]
    
    # Run backtest
    response = client.post(f"/api/backtests/{backtest_id}/run")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Get backtest progress
    response = client.get(f"/api/backtests/{backtest_id}/progress")
    assert response.status_code == 200
    assert "progress" in response.json()
    assert "status" in response.json()
    assert "current_step" in response.json()
    
    # Get backtest logs
    response = client.get(f"/api/backtests/{backtest_id}/logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Get backtest metrics
    response = client.get(f"/api/backtests/{backtest_id}/metrics")
    assert response.status_code == 200
    assert "total_return" in response.json()
    assert "sharpe_ratio" in response.json()
    assert "max_drawdown" in response.json()
    assert "win_rate" in response.json()

def test_backtest_analysis(client, backtest_service, test_backtest_data):
    # Test backtest analysis
    # Create backtest
    response = client.post("/api/backtests", json=test_backtest_data)
    backtest_id = response.json()["id"]
    
    # Run backtest
    client.post(f"/api/backtests/{backtest_id}/run")
    
    # Get performance analysis
    response = client.get(f"/api/backtests/{backtest_id}/analysis/performance")
    assert response.status_code == 200
    assert "returns" in response.json()
    assert "drawdowns" in response.json()
    assert "volatility" in response.json()
    assert "risk_metrics" in response.json()
    
    # Get trade analysis
    response = client.get(f"/api/backtests/{backtest_id}/analysis/trades")
    assert response.status_code == 200
    assert "trade_distribution" in response.json()
    assert "win_loss_ratio" in response.json()
    assert "average_trade" in response.json()
    assert "trade_duration" in response.json()
    
    # Get risk analysis
    response = client.get(f"/api/backtests/{backtest_id}/analysis/risk")
    assert response.status_code == 200
    assert "var" in response.json()
    assert "cvar" in response.json()
    assert "beta" in response.json()
    assert "correlation" in response.json()
    
    # Get optimization analysis
    response = client.get(f"/api/backtests/{backtest_id}/analysis/optimization")
    assert response.status_code == 200
    assert "parameter_sensitivity" in response.json()
    assert "optimal_parameters" in response.json()
    assert "parameter_correlation" in response.json()

def test_backtest_comparison(client, backtest_service, test_backtest_data):
    # Test backtest comparison
    # Create first backtest
    response1 = client.post("/api/backtests", json=test_backtest_data)
    backtest_id1 = response1.json()["id"]
    
    # Create second backtest
    test_backtest_data["name"] = "Test Backtest 2"
    test_backtest_data["parameters"]["grid_size"] = 20
    response2 = client.post("/api/backtests", json=test_backtest_data)
    backtest_id2 = response2.json()["id"]
    
    # Run both backtests
    client.post(f"/api/backtests/{backtest_id1}/run")
    client.post(f"/api/backtests/{backtest_id2}/run")
    
    # Compare backtests
    response = client.get(f"/api/backtests/compare?ids={backtest_id1},{backtest_id2}")
    assert response.status_code == 200
    assert "performance_comparison" in response.json()
    assert "metrics_comparison" in response.json()
    assert "trade_comparison" in response.json()
    assert "risk_comparison" in response.json()

def test_backtest_export(client, backtest_service, test_backtest_data):
    # Test backtest export
    # Create backtest
    response = client.post("/api/backtests", json=test_backtest_data)
    backtest_id = response.json()["id"]
    
    # Run backtest
    client.post(f"/api/backtests/{backtest_id}/run")
    
    # Export results
    response = client.get(f"/api/backtests/{backtest_id}/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    # Export trades
    response = client.get(f"/api/backtests/{backtest_id}/export/trades")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv"
    
    # Export metrics
    response = client.get(f"/api/backtests/{backtest_id}/export/metrics")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    # Export charts
    response = client.get(f"/api/backtests/{backtest_id}/export/charts")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

def test_backtest_error_handling(client, backtest_service):
    # Test backtest error handling
    # Test invalid backtest ID
    response = client.get("/api/backtests/invalid_id")
    assert response.status_code == 404
    
    # Test duplicate backtest name
    backtest_data = {
        "name": "Test Backtest",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": 10,
            "grid_spacing": 0.1,
            "position_size": 0.01
        }
    }
    
    client.post("/api/backtests", json=backtest_data)
    response = client.post("/api/backtests", json=backtest_data)
    assert response.status_code == 400
    
    # Test invalid operation
    response = client.post("/api/backtests/123/invalid_operation")
    assert response.status_code == 404
    
    # Test invalid export format
    response = client.get("/api/backtests/123/export/invalid")
    assert response.status_code == 422

def test_backtest_security(client, backtest_service, test_backtest_data):
    # Test backtest security
    # Create backtest
    response = client.post("/api/backtests", json=test_backtest_data)
    backtest_id = response.json()["id"]
    
    # Test rate limiting
    for _ in range(100):
        response = client.get(f"/api/backtests/{backtest_id}")
    
    assert response.status_code == 429
    
    # Test data validation
    response = client.get(f"/api/backtests/{backtest_id}/results")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "performance" in data
    assert "trades" in data
    assert "metrics" in data
    
    # Test data sanitization
    response = client.get(f"/api/backtests/{backtest_id}/results?fields=performance,metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "performance" in data
    assert "metrics" in data
    assert "trades" not in data 