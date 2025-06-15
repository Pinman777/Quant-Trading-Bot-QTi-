import pytest
from fastapi import status

def test_create_server(authorized_client):
    response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Server"
    assert data["host"] == "localhost"
    assert data["port"] == 22
    assert data["username"] == "testuser"
    assert data["password"] == "testpass"
    assert data["rclone_config"]["type"] == "sftp"
    assert "id" in data
    assert "owner_id" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_create_server_unauthorized(client):
    response = client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_servers(authorized_client):
    # Create a server first
    authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    
    response = authorized_client.get("/api/v1/servers")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["name"] == "Test Server"

def test_get_server(authorized_client):
    # Create a server first
    create_response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    server_id = create_response.json()["id"]
    
    response = authorized_client.get(f"/api/v1/servers/{server_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Server"
    assert data["id"] == server_id

def test_get_nonexistent_server(authorized_client):
    response = authorized_client.get("/api/v1/servers/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_server(authorized_client):
    # Create a server first
    create_response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    server_id = create_response.json()["id"]
    
    response = authorized_client.put(
        f"/api/v1/servers/{server_id}",
        json={
            "name": "Updated Server",
            "host": "localhost",
            "port": 2222,
            "username": "newuser",
            "password": "newpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "newuser",
                "pass": "newpass"
            }
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Server"
    assert data["port"] == 2222
    assert data["username"] == "newuser"

def test_delete_server(authorized_client):
    # Create a server first
    create_response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    server_id = create_response.json()["id"]
    
    response = authorized_client.delete(f"/api/v1/servers/{server_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify server is deleted
    get_response = authorized_client.get(f"/api/v1/servers/{server_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_test_connection(authorized_client):
    # Create a server first
    create_response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    server_id = create_response.json()["id"]
    
    response = authorized_client.post(f"/api/v1/servers/{server_id}/test")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "message" in data

def test_sync_server(authorized_client):
    # Create a server first
    create_response = authorized_client.post(
        "/api/v1/servers",
        json={
            "name": "Test Server",
            "host": "localhost",
            "port": 22,
            "username": "testuser",
            "password": "testpass",
            "rclone_config": {
                "type": "sftp",
                "host": "localhost",
                "user": "testuser",
                "pass": "testpass"
            }
        }
    )
    server_id = create_response.json()["id"]
    
    response = authorized_client.post(f"/api/v1/servers/{server_id}/sync")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "message" in data 