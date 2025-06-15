import pytest
from fastapi import status
import os
import json

def test_get_rclone_version(authorized_client):
    response = authorized_client.get("/api/v1/rclone/version")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "version" in data
    assert "os" in data
    assert "arch" in data

def test_get_rclone_version_unauthorized(client):
    response = client.get("/api/v1/rclone/version")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_rclone_config(authorized_client):
    response = authorized_client.get("/api/v1/rclone/config")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "config" in data
    assert isinstance(data["config"], dict)

def test_get_rclone_config_unauthorized(client):
    response = client.get("/api/v1/rclone/config")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_rclone_config(authorized_client):
    config = {
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    
    response = authorized_client.put(
        "/api/v1/rclone/config",
        json={"config": config}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["config"] == config

def test_update_rclone_config_unauthorized(client):
    config = {
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    
    response = client.put(
        "/api/v1/rclone/config",
        json={"config": config}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_list_rclone_remotes(authorized_client):
    response = authorized_client.get("/api/v1/rclone/remotes")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "remotes" in data
    assert isinstance(data["remotes"], list)

def test_list_rclone_remotes_unauthorized(client):
    response = client.get("/api/v1/rclone/remotes")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_add_rclone_remote(authorized_client):
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    
    response = authorized_client.post(
        "/api/v1/rclone/remotes",
        json=remote
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == remote["name"]
    assert data["type"] == remote["type"]

def test_add_rclone_remote_unauthorized(client):
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    
    response = client.post(
        "/api/v1/rclone/remotes",
        json=remote
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_delete_rclone_remote(authorized_client):
    # Add a remote first
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    authorized_client.post("/api/v1/rclone/remotes", json=remote)
    
    response = authorized_client.delete("/api/v1/rclone/remotes/test_remote")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify remote is deleted
    get_response = authorized_client.get("/api/v1/rclone/remotes")
    assert get_response.status_code == status.HTTP_200_OK
    data = get_response.json()
    assert "test_remote" not in [r["name"] for r in data["remotes"]]

def test_delete_rclone_remote_unauthorized(client):
    response = client.delete("/api/v1/rclone/remotes/test_remote")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_sync_rclone_remote(authorized_client):
    # Add a remote first
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    authorized_client.post("/api/v1/rclone/remotes", json=remote)
    
    response = authorized_client.post("/api/v1/rclone/remotes/test_remote/sync")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "status" in data
    assert "message" in data

def test_sync_rclone_remote_unauthorized(client):
    response = client.post("/api/v1/rclone/remotes/test_remote/sync")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_list_rclone_files(authorized_client):
    # Add a remote first
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    authorized_client.post("/api/v1/rclone/remotes", json=remote)
    
    response = authorized_client.get("/api/v1/rclone/remotes/test_remote/files")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "files" in data
    assert isinstance(data["files"], list)

def test_list_rclone_files_unauthorized(client):
    response = client.get("/api/v1/rclone/remotes/test_remote/files")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_list_rclone_files_with_path(authorized_client):
    # Add a remote first
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    authorized_client.post("/api/v1/rclone/remotes", json=remote)
    
    response = authorized_client.get(
        "/api/v1/rclone/remotes/test_remote/files",
        params={"path": "/config"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "files" in data
    assert isinstance(data["files"], list)

def test_list_rclone_files_with_invalid_path(authorized_client):
    # Add a remote first
    remote = {
        "name": "test_remote",
        "type": "sftp",
        "host": "localhost",
        "user": "testuser",
        "pass": "testpass"
    }
    authorized_client.post("/api/v1/rclone/remotes", json=remote)
    
    response = authorized_client.get(
        "/api/v1/rclone/remotes/test_remote/files",
        params={"path": "/invalid/path"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_list_rclone_files_with_nonexistent_remote(authorized_client):
    response = authorized_client.get("/api/v1/rclone/remotes/nonexistent/files")
    assert response.status_code == status.HTTP_404_NOT_FOUND 