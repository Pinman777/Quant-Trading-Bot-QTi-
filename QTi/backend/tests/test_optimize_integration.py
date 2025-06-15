import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.optimize import router as optimize_router
from app.services.optimize_service import OptimizeService
from app.schemas.optimize import OptimizeCreate, OptimizeUpdate, OptimizeResponse
from app.core.config import settings
import json
import os

@pytest.fixture
def app():
    app = FastAPI()
    app.include_router(optimize_router)
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

@pytest.fixture
def optimize_service():
    return OptimizeService()

@pytest.fixture
def test_optimize_data():
    return {
        "name": "Test Optimization",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": {
                "min": 5,
                "max": 20,
                "step": 5
            },
            "grid_spacing": {
                "min": 0.05,
                "max": 0.2,
                "step": 0.05
            },
            "position_size": {
                "min": 0.005,
                "max": 0.02,
                "step": 0.005
            }
        },
        "objective": "sharpe_ratio",
        "constraints": {
            "max_drawdown": 0.2,
            "min_trades": 100
        }
    }

def test_optimize_lifecycle(client, optimize_service, test_optimize_data):
    # Test complete optimization lifecycle
    # Create optimization
    response = client.post("/api/optimize", json=test_optimize_data)
    assert response.status_code == 200
    optimize_id = response.json()["id"]
    
    # Get optimization
    response = client.get(f"/api/optimize/{optimize_id}")
    assert response.status_code == 200
    assert response.json()["name"] == test_optimize_data["name"]
    
    # Update optimization
    update_data = {
        "name": "Updated Optimization",
        "symbol": "ETHUSDT",
        "timeframe": "4h",
        "start_date": "2023-02-01",
        "end_date": "2023-11-30",
        "strategy": "grid",
        "parameters": {
            "grid_size": {
                "min": 10,
                "max": 30,
                "step": 5
            },
            "grid_spacing": {
                "min": 0.1,
                "max": 0.3,
                "step": 0.05
            },
            "position_size": {
                "min": 0.01,
                "max": 0.03,
                "step": 0.005
            }
        },
        "objective": "total_return",
        "constraints": {
            "max_drawdown": 0.15,
            "min_trades": 200
        }
    }
    
    response = client.put(f"/api/optimize/{optimize_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]
    
    # Run optimization
    response = client.post(f"/api/optimize/{optimize_id}/run")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Get optimization status
    response = client.get(f"/api/optimize/{optimize_id}/status")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "progress" in response.json()
    
    # Get optimization results
    response = client.get(f"/api/optimize/{optimize_id}/results")
    assert response.status_code == 200
    assert "best_parameters" in response.json()
    assert "performance" in response.json()
    assert "metrics" in response.json()
    
    # Delete optimization
    response = client.delete(f"/api/optimize/{optimize_id}")
    assert response.status_code == 200

def test_optimize_validation(client, optimize_service):
    # Test optimization validation
    # Test invalid symbol
    invalid_data = {
        "name": "Test Optimization",
        "symbol": "INVALID",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": {
                "min": 5,
                "max": 20,
                "step": 5
            },
            "grid_spacing": {
                "min": 0.05,
                "max": 0.2,
                "step": 0.05
            },
            "position_size": {
                "min": 0.005,
                "max": 0.02,
                "step": 0.005
            }
        },
        "objective": "sharpe_ratio",
        "constraints": {
            "max_drawdown": 0.2,
            "min_trades": 100
        }
    }
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid timeframe
    invalid_data["symbol"] = "BTCUSDT"
    invalid_data["timeframe"] = "invalid"
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid dates
    invalid_data["timeframe"] = "1h"
    invalid_data["start_date"] = "2023-12-31"
    invalid_data["end_date"] = "2023-01-01"
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid strategy
    invalid_data["start_date"] = "2023-01-01"
    invalid_data["end_date"] = "2023-12-31"
    invalid_data["strategy"] = "invalid"
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid parameters
    invalid_data["strategy"] = "grid"
    invalid_data["parameters"]["grid_size"]["min"] = 20
    invalid_data["parameters"]["grid_size"]["max"] = 5
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422
    
    # Test invalid objective
    invalid_data["parameters"]["grid_size"]["min"] = 5
    invalid_data["parameters"]["grid_size"]["max"] = 20
    invalid_data["objective"] = "invalid"
    
    response = client.post("/api/optimize", json=invalid_data)
    assert response.status_code == 422

def test_optimize_operations(client, optimize_service, test_optimize_data):
    # Test optimization operations
    # Create optimization
    response = client.post("/api/optimize", json=test_optimize_data)
    optimize_id = response.json()["id"]
    
    # Run optimization
    response = client.post(f"/api/optimize/{optimize_id}/run")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
    
    # Get optimization progress
    response = client.get(f"/api/optimize/{optimize_id}/progress")
    assert response.status_code == 200
    assert "progress" in response.json()
    assert "status" in response.json()
    assert "current_step" in response.json()
    
    # Get optimization logs
    response = client.get(f"/api/optimize/{optimize_id}/logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    # Get optimization metrics
    response = client.get(f"/api/optimize/{optimize_id}/metrics")
    assert response.status_code == 200
    assert "best_parameters" in response.json()
    assert "performance" in response.json()
    assert "metrics" in response.json()

def test_optimize_analysis(client, optimize_service, test_optimize_data):
    # Test optimization analysis
    # Create optimization
    response = client.post("/api/optimize", json=test_optimize_data)
    optimize_id = response.json()["id"]
    
    # Run optimization
    client.post(f"/api/optimize/{optimize_id}/run")
    
    # Get parameter analysis
    response = client.get(f"/api/optimize/{optimize_id}/analysis/parameters")
    assert response.status_code == 200
    assert "parameter_importance" in response.json()
    assert "parameter_correlation" in response.json()
    assert "parameter_sensitivity" in response.json()
    
    # Get performance analysis
    response = client.get(f"/api/optimize/{optimize_id}/analysis/performance")
    assert response.status_code == 200
    assert "returns" in response.json()
    assert "drawdowns" in response.json()
    assert "volatility" in response.json()
    assert "risk_metrics" in response.json()
    
    # Get trade analysis
    response = client.get(f"/api/optimize/{optimize_id}/analysis/trades")
    assert response.status_code == 200
    assert "trade_distribution" in response.json()
    assert "win_loss_ratio" in response.json()
    assert "average_trade" in response.json()
    assert "trade_duration" in response.json()
    
    # Get risk analysis
    response = client.get(f"/api/optimize/{optimize_id}/analysis/risk")
    assert response.status_code == 200
    assert "var" in response.json()
    assert "cvar" in response.json()
    assert "beta" in response.json()
    assert "correlation" in response.json()

def test_optimize_comparison(client, optimize_service, test_optimize_data):
    # Test optimization comparison
    # Create first optimization
    response1 = client.post("/api/optimize", json=test_optimize_data)
    optimize_id1 = response1.json()["id"]
    
    # Create second optimization
    test_optimize_data["name"] = "Test Optimization 2"
    test_optimize_data["parameters"]["grid_size"]["max"] = 30
    response2 = client.post("/api/optimize", json=test_optimize_data)
    optimize_id2 = response2.json()["id"]
    
    # Run both optimizations
    client.post(f"/api/optimize/{optimize_id1}/run")
    client.post(f"/api/optimize/{optimize_id2}/run")
    
    # Compare optimizations
    response = client.get(f"/api/optimize/compare?ids={optimize_id1},{optimize_id2}")
    assert response.status_code == 200
    assert "parameter_comparison" in response.json()
    assert "performance_comparison" in response.json()
    assert "metrics_comparison" in response.json()
    assert "trade_comparison" in response.json()

def test_optimize_export(client, optimize_service, test_optimize_data):
    # Test optimization export
    # Create optimization
    response = client.post("/api/optimize", json=test_optimize_data)
    optimize_id = response.json()["id"]
    
    # Run optimization
    client.post(f"/api/optimize/{optimize_id}/run")
    
    # Export results
    response = client.get(f"/api/optimize/{optimize_id}/export")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    # Export parameters
    response = client.get(f"/api/optimize/{optimize_id}/export/parameters")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv"
    
    # Export metrics
    response = client.get(f"/api/optimize/{optimize_id}/export/metrics")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    
    # Export charts
    response = client.get(f"/api/optimize/{optimize_id}/export/charts")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

def test_optimize_error_handling(client, optimize_service):
    # Test optimization error handling
    # Test invalid optimization ID
    response = client.get("/api/optimize/invalid_id")
    assert response.status_code == 404
    
    # Test duplicate optimization name
    optimize_data = {
        "name": "Test Optimization",
        "symbol": "BTCUSDT",
        "timeframe": "1h",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "strategy": "grid",
        "parameters": {
            "grid_size": {
                "min": 5,
                "max": 20,
                "step": 5
            },
            "grid_spacing": {
                "min": 0.05,
                "max": 0.2,
                "step": 0.05
            },
            "position_size": {
                "min": 0.005,
                "max": 0.02,
                "step": 0.005
            }
        },
        "objective": "sharpe_ratio",
        "constraints": {
            "max_drawdown": 0.2,
            "min_trades": 100
        }
    }
    
    client.post("/api/optimize", json=optimize_data)
    response = client.post("/api/optimize", json=optimize_data)
    assert response.status_code == 400
    
    # Test invalid operation
    response = client.post("/api/optimize/123/invalid_operation")
    assert response.status_code == 404
    
    # Test invalid export format
    response = client.get("/api/optimize/123/export/invalid")
    assert response.status_code == 422

def test_optimize_security(client, optimize_service, test_optimize_data):
    # Test optimization security
    # Create optimization
    response = client.post("/api/optimize", json=test_optimize_data)
    optimize_id = response.json()["id"]
    
    # Test rate limiting
    for _ in range(100):
        response = client.get(f"/api/optimize/{optimize_id}")
    
    assert response.status_code == 429
    
    # Test data validation
    response = client.get(f"/api/optimize/{optimize_id}/results")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "best_parameters" in data
    assert "performance" in data
    assert "metrics" in data
    
    # Test data sanitization
    response = client.get(f"/api/optimize/{optimize_id}/results?fields=best_parameters,metrics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "best_parameters" in data
    assert "metrics" in data
    assert "performance" not in data 