import pytest
from fastapi import status
import os
import json

def test_get_global_metrics(authorized_client):
    response = authorized_client.get("/api/v1/market/global")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_market_cap" in data
    assert "total_volume_24h" in data
    assert "btc_dominance" in data
    assert "eth_dominance" in data

def test_get_global_metrics_unauthorized(client):
    response = client.get("/api/v1/market/global")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_cryptocurrencies(authorized_client):
    response = authorized_client.get("/api/v1/market/cryptocurrencies")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "name" in data[0]
    assert "symbol" in data[0]
    assert "price" in data[0]
    assert "market_cap" in data[0]
    assert "volume_24h" in data[0]

def test_get_cryptocurrencies_unauthorized(client):
    response = client.get("/api/v1/market/cryptocurrencies")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_cryptocurrency(authorized_client):
    response = authorized_client.get("/api/v1/market/cryptocurrencies/1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert "name" in data
    assert "symbol" in data
    assert "price" in data
    assert "market_cap" in data
    assert "volume_24h" in data
    assert "description" in data
    assert "website" in data
    assert "social_links" in data

def test_get_cryptocurrency_unauthorized(client):
    response = client.get("/api/v1/market/cryptocurrencies/1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_nonexistent_cryptocurrency(authorized_client):
    response = authorized_client.get("/api/v1/market/cryptocurrencies/999999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_get_cryptocurrency_ohlcv(authorized_client):
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "timestamp" in data[0]
    assert "open" in data[0]
    assert "high" in data[0]
    assert "low" in data[0]
    assert "close" in data[0]
    assert "volume" in data[0]

def test_get_cryptocurrency_ohlcv_unauthorized(client):
    response = client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_cryptocurrency_ohlcv_invalid_timeframe(authorized_client):
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "invalid",
            "limit": 100
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_cryptocurrency_ohlcv_invalid_limit(authorized_client):
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": -1
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_search_cryptocurrencies(authorized_client):
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/search",
        params={"query": "bitcoin"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "name" in data[0]
    assert "symbol" in data[0]

def test_search_cryptocurrencies_unauthorized(client):
    response = client.get(
        "/api/v1/market/cryptocurrencies/search",
        params={"query": "bitcoin"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_search_cryptocurrencies_empty_query(authorized_client):
    response = authorized_client.get(
        "/api/v1/market/cryptocurrencies/search",
        params={"query": ""}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_cryptocurrency_metadata(authorized_client):
    response = authorized_client.get("/api/v1/market/cryptocurrencies/1/metadata")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert "name" in data
    assert "symbol" in data
    assert "logo" in data
    assert "description" in data
    assert "website" in data
    assert "social_links" in data
    assert "tags" in data

def test_get_cryptocurrency_metadata_unauthorized(client):
    response = client.get("/api/v1/market/cryptocurrencies/1/metadata")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_cryptocurrency_metadata_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/market/cryptocurrencies/999999/metadata")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_get_cryptocurrency_metadata_cached(authorized_client):
    # First request
    response1 = authorized_client.get("/api/v1/market/cryptocurrencies/1/metadata")
    assert response1.status_code == status.HTTP_200_OK
    
    # Second request (should be cached)
    response2 = authorized_client.get("/api/v1/market/cryptocurrencies/1/metadata")
    assert response2.status_code == status.HTTP_200_OK
    
    # Verify responses are identical
    assert response1.json() == response2.json()

def test_get_cryptocurrency_ohlcv_cached(authorized_client):
    # First request
    response1 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response1.status_code == status.HTTP_200_OK
    
    # Second request (should be cached)
    response2 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response2.status_code == status.HTTP_200_OK
    
    # Verify responses are identical
    assert response1.json() == response2.json()

def test_get_cryptocurrency_ohlcv_different_timeframes(authorized_client):
    # Request for 1h timeframe
    response1 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response1.status_code == status.HTTP_200_OK
    
    # Request for 4h timeframe
    response2 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "4h",
            "limit": 100
        }
    )
    assert response2.status_code == status.HTTP_200_OK
    
    # Verify responses are different
    assert response1.json() != response2.json()

def test_get_cryptocurrency_ohlcv_different_limits(authorized_client):
    # Request with limit 50
    response1 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 50
        }
    )
    assert response1.status_code == status.HTTP_200_OK
    
    # Request with limit 100
    response2 = authorized_client.get(
        "/api/v1/market/cryptocurrencies/1/ohlcv",
        params={
            "timeframe": "1h",
            "limit": 100
        }
    )
    assert response2.status_code == status.HTTP_200_OK
    
    # Verify responses are different
    assert len(response1.json()) < len(response2.json()) 