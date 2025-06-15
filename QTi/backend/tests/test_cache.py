import pytest
from fastapi import status
import time
from app.services.cache_service import CacheService
from app.config import settings

def test_cache_set_get(authorized_client):
    # Set cache
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value"}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Get cache
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == "test_value"

def test_cache_set_get_unauthorized(client):
    # Set cache
    response = client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Get cache
    response = client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_cache_expiration(authorized_client):
    # Set cache with short expiration
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value"},
        params={"expire": 1}  # 1 second expiration
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Get cache immediately
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == "test_value"
    
    # Wait for expiration
    time.sleep(2)
    
    # Get cache after expiration
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_cache_delete(authorized_client):
    # Set cache
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value"}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Delete cache
    response = authorized_client.delete("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify cache is deleted
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_cache_delete_unauthorized(client):
    response = client.delete("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_cache_clear(authorized_client):
    # Set multiple cache entries
    authorized_client.post(
        "/api/v1/cache/test_key1",
        json={"value": "test_value1"}
    )
    authorized_client.post(
        "/api/v1/cache/test_key2",
        json={"value": "test_value2"}
    )
    
    # Clear cache
    response = authorized_client.delete("/api/v1/cache")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify all cache entries are deleted
    response = authorized_client.get("/api/v1/cache/test_key1")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    response = authorized_client.get("/api/v1/cache/test_key2")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_cache_clear_unauthorized(client):
    response = client.delete("/api/v1/cache")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_cache_get_nonexistent(authorized_client):
    response = authorized_client.get("/api/v1/cache/nonexistent_key")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_cache_set_invalid_value(authorized_client):
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"invalid": "value"}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_cache_set_invalid_expiration(authorized_client):
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value"},
        params={"expire": -1}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_cache_set_get_complex_object(authorized_client):
    complex_object = {
        "string": "test",
        "number": 123,
        "boolean": True,
        "array": [1, 2, 3],
        "object": {
            "key": "value"
        }
    }
    
    # Set cache
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": complex_object}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Get cache
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == complex_object

def test_cache_set_get_large_object(authorized_client):
    # Create a large object
    large_object = {
        "data": "x" * (settings.CACHE_MAX_SIZE + 1)
    }
    
    # Set cache
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": large_object}
    )
    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

def test_cache_set_get_multiple_keys(authorized_client):
    # Set multiple cache entries
    authorized_client.post(
        "/api/v1/cache/test_key1",
        json={"value": "test_value1"}
    )
    authorized_client.post(
        "/api/v1/cache/test_key2",
        json={"value": "test_value2"}
    )
    
    # Get first cache entry
    response = authorized_client.get("/api/v1/cache/test_key1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == "test_value1"
    
    # Get second cache entry
    response = authorized_client.get("/api/v1/cache/test_key2")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == "test_value2"

def test_cache_set_get_same_key(authorized_client):
    # Set cache first time
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value1"}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Set cache second time
    response = authorized_client.post(
        "/api/v1/cache/test_key",
        json={"value": "test_value2"}
    )
    assert response.status_code == status.HTTP_200_OK
    
    # Get cache
    response = authorized_client.get("/api/v1/cache/test_key")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["value"] == "test_value2" 