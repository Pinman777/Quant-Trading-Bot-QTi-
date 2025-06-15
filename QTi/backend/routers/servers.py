from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from .. import crud, schemas, security
from ..database import get_db
import subprocess
import json
import os
from pathlib import Path
from datetime import datetime
import asyncio

from ..models import Server, User
from ..schemas.server import ServerCreate, ServerUpdate, ServerResponse
from ..dependencies import get_current_user
from ..services.server_manager import ServerManager

router = APIRouter(prefix="/servers", tags=["servers"])
server_manager = ServerManager()

# Server management endpoints
@router.get("/", response_model=List[ServerResponse])
async def get_servers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Server).filter(Server.owner_id == current_user.id).all()

@router.post("/", response_model=ServerResponse)
async def create_server(
    server: ServerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_server = Server(
        name=server.name,
        host=server.host,
        port=server.port,
        username=server.username,
        password=server.password,
        rclone_config=server.rclone_config,
        owner_id=current_user.id
    )
    db.add(db_server)
    db.commit()
    db.refresh(db_server)
    return db_server

@router.get("/{server_id}", response_model=ServerResponse)
async def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user.id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    return server

@router.put("/{server_id}", response_model=ServerResponse)
async def update_server(
    server_id: int,
    server_update: ServerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user.id
    ).first()
    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    for field, value in server_update.dict(exclude_unset=True).items():
        setattr(db_server, field, value)
    
    db.commit()
    db.refresh(db_server)
    return db_server

@router.delete("/{server_id}")
async def delete_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user.id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    db.delete(server)
    db.commit()
    return {"message": "Server deleted successfully"}

# Server operations
@router.post("/{server_id}/test")
async def test_server_connection(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user.id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    try:
        result = await server_manager.test_connection(server)
        return {"message": "Connection successful", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{server_id}/sync")
async def sync_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    server = db.query(Server).filter(
        Server.id == server_id,
        Server.owner_id == current_user.id
    ).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    try:
        result = await server_manager.sync_server(server)
        return {"message": "Sync completed successfully", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def sync_server_data(server: schemas.ServerConfig) -> None:
    """Sync data with remote server using rclone"""
    try:
        # Create rclone config if it doesn't exist
        rclone_config_path = Path.home() / ".config" / "rclone" / "rclone.conf"
        rclone_config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Add remote configuration
        remote_config = f"""
[{server.name}]
type = sftp
host = {server.host}
port = {server.port}
user = {server.username}
pass = {server.password}
"""
        
        with open(rclone_config_path, "a") as f:
            f.write(remote_config)
        
        # Sync data
        subprocess.run(
            ["rclone", "sync", f"{server.name}:", "./data/remote"],
            check=True
        )
        
        # Sync back
        subprocess.run(
            ["rclone", "sync", "./data/remote", f"{server.name}:"],
            check=True
        )
    except Exception as e:
        print(f"Error syncing server {server.name}: {str(e)}")
        # TODO: Add proper error handling and logging 