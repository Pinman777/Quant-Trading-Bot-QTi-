from typing import List
from fastapi import APIRouter, HTTPException
from ...schemas.server import Server, ServerCreate, ServerUpdate
from ...services.server import server_service

router = APIRouter()

@router.get("/servers", response_model=List[Server])
async def get_servers():
    """Get list of all servers"""
    try:
        return server_service.get_servers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/servers/{server_id}", response_model=Server)
async def get_server(server_id: str):
    """Get server by ID"""
    try:
        return server_service.get_server(server_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/servers", response_model=Server)
async def add_server(server: ServerCreate):
    """Add new server"""
    try:
        return server_service.add_server(server)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/servers/{server_id}", response_model=Server)
async def update_server(server_id: str, server: ServerUpdate):
    """Update server"""
    try:
        return server_service.update_server(server_id, server)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/servers/{server_id}")
async def delete_server(server_id: str):
    """Delete server"""
    try:
        server_service.delete_server(server_id)
        return {"message": "Server deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/servers/{server_id}/sync")
async def sync_server(server_id: str):
    """Sync server configurations"""
    try:
        server_service.sync_server(server_id)
        return {"message": "Server synchronized successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/servers/{server_id}/refresh", response_model=Server)
async def refresh_server(server_id: str):
    """Refresh server status"""
    try:
        return server_service.refresh_server(server_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 