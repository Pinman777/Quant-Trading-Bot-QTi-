import pytest
from fastapi import status
import os
import json

def test_api_documentation(authorized_client):
    # Test OpenAPI documentation
    response = authorized_client.get("/docs")
    assert response.status_code == status.HTTP_200_OK
    assert "swagger-ui" in response.text
    
    response = authorized_client.get("/redoc")
    assert response.status_code == status.HTTP_200_OK
    assert "redoc" in response.text
    
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "openapi" in data
    assert "info" in data
    assert "paths" in data
    assert "components" in data

def test_api_documentation_unauthorized(client):
    # Test OpenAPI documentation without authentication
    response = client.get("/docs")
    assert response.status_code == status.HTTP_200_OK
    
    response = client.get("/redoc")
    assert response.status_code == status.HTTP_200_OK
    
    response = client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK

def test_api_schema(authorized_client):
    # Test API schema
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    
    # Verify required paths
    required_paths = [
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/auth/me",
        "/api/v1/auth/refresh",
        "/api/v1/auth/logout",
        "/api/v1/bots",
        "/api/v1/bots/{bot_id}",
        "/api/v1/bots/{bot_id}/start",
        "/api/v1/bots/{bot_id}/stop",
        "/api/v1/bots/{bot_id}/stats",
        "/api/v1/servers",
        "/api/v1/servers/{server_id}",
        "/api/v1/servers/{server_id}/test",
        "/api/v1/servers/{server_id}/sync",
        "/api/v1/market/global",
        "/api/v1/market/cryptocurrencies",
        "/api/v1/market/cryptocurrencies/{id}",
        "/api/v1/market/cryptocurrencies/{id}/ohlcv",
        "/api/v1/market/cryptocurrencies/{id}/metadata",
        "/api/v1/backtests",
        "/api/v1/backtests/{id}",
        "/api/v1/backtests/{id}/results",
        "/api/v1/backtests/{id}/trades",
        "/api/v1/optimizations",
        "/api/v1/optimizations/{id}",
        "/api/v1/optimizations/{id}/results",
        "/api/v1/optimizations/{id}/progress"
    ]
    
    for path in required_paths:
        assert path in schema["paths"]
    
    # Verify required components
    required_components = [
        "schemas",
        "securitySchemes"
    ]
    
    for component in required_components:
        assert component in schema["components"]
    
    # Verify required schemas
    required_schemas = [
        "UserBase",
        "UserCreate",
        "UserUpdate",
        "UserResponse",
        "Token",
        "TokenData",
        "BotBase",
        "BotCreate",
        "BotUpdate",
        "BotResponse",
        "ServerBase",
        "ServerCreate",
        "ServerUpdate",
        "ServerResponse",
        "BacktestBase",
        "BacktestCreate",
        "BacktestResponse",
        "OptimizationBase",
        "OptimizationCreate",
        "OptimizationResponse"
    ]
    
    for schema_name in required_schemas:
        assert schema_name in schema["components"]["schemas"]

def test_readme_exists():
    # Verify README.md exists
    assert os.path.exists("README.md")
    
    # Verify README.md content
    with open("README.md", "r", encoding="utf-8") as f:
        content = f.read()
        assert "# QTi" in content
        assert "## Installation" in content
        assert "## Usage" in content
        assert "## API Documentation" in content
        assert "## Contributing" in content
        assert "## License" in content

def test_license_exists():
    # Verify LICENSE exists
    assert os.path.exists("LICENSE")
    
    # Verify LICENSE content
    with open("LICENSE", "r", encoding="utf-8") as f:
        content = f.read()
        assert "MIT License" in content
        assert "Copyright (c)" in content

def test_contributing_exists():
    # Verify CONTRIBUTING.md exists
    assert os.path.exists("CONTRIBUTING.md")
    
    # Verify CONTRIBUTING.md content
    with open("CONTRIBUTING.md", "r", encoding="utf-8") as f:
        content = f.read()
        assert "# Contributing to QTi" in content
        assert "## Code Style" in content
        assert "## Pull Request Process" in content
        assert "## Development Process" in content

def test_changelog_exists():
    # Verify CHANGELOG.md exists
    assert os.path.exists("CHANGELOG.md")
    
    # Verify CHANGELOG.md content
    with open("CHANGELOG.md", "r", encoding="utf-8") as f:
        content = f.read()
        assert "# Changelog" in content
        assert "## [Unreleased]" in content
        assert "## [1.0.0]" in content

def test_api_examples(authorized_client):
    # Test API examples in documentation
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    
    # Verify examples in paths
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            if method in ["post", "put"]:
                assert "requestBody" in operation
                if "content" in operation["requestBody"]:
                    for content_type, content in operation["requestBody"]["content"].items():
                        if "example" in content:
                            assert isinstance(content["example"], dict)
            
            if "responses" in operation:
                for status_code, response in operation["responses"].items():
                    if "content" in response:
                        for content_type, content in response["content"].items():
                            if "example" in content:
                                assert isinstance(content["example"], dict)

def test_api_descriptions(authorized_client):
    # Test API descriptions in documentation
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    
    # Verify descriptions in paths
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            assert "summary" in operation
            assert "description" in operation
            assert "tags" in operation
            
            if "parameters" in operation:
                for parameter in operation["parameters"]:
                    assert "description" in parameter
            
            if "requestBody" in operation:
                assert "description" in operation["requestBody"]
            
            if "responses" in operation:
                for status_code, response in operation["responses"].items():
                    assert "description" in response

def test_api_tags(authorized_client):
    # Test API tags in documentation
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    
    # Verify tags
    required_tags = [
        "Authentication",
        "Bots",
        "Servers",
        "Market",
        "Backtests",
        "Optimizations"
    ]
    
    for tag in required_tags:
        assert any(t["name"] == tag for t in schema["tags"])
    
    # Verify tag descriptions
    for tag in schema["tags"]:
        assert "description" in tag

def test_api_security(authorized_client):
    # Test API security in documentation
    response = authorized_client.get("/openapi.json")
    assert response.status_code == status.HTTP_200_OK
    schema = response.json()
    
    # Verify security schemes
    assert "Bearer" in schema["components"]["securitySchemes"]
    security_scheme = schema["components"]["securitySchemes"]["Bearer"]
    assert security_scheme["type"] == "http"
    assert security_scheme["scheme"] == "bearer"
    assert security_scheme["bearerFormat"] == "JWT"
    
    # Verify security requirements
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            if method != "get" or path != "/api/v1/auth/me":
                assert "security" in operation
                assert {"Bearer": []} in operation["security"] 