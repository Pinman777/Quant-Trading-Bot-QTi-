from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ...core.remote_sync import RemoteSync
from ...dependencies import get_remote_sync

router = APIRouter(prefix="/api/remote", tags=["remote"])

class RemoteConfig(BaseModel):
    name: str
    type: str
    config: Dict[str, str]

class SyncConfig(BaseModel):
    remote_name: str
    local_path: str
    remote_path: str
    exclude: Optional[List[str]] = None

@router.get("/list", response_model=List[Dict[str, Any]])
async def list_remotes(remote_sync: RemoteSync = Depends(get_remote_sync)):
    """Получить список удаленных хранилищ"""
    try:
        return await remote_sync.list_remotes()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info/{remote_name}", response_model=Dict[str, Any])
async def get_remote_info(
    remote_name: str,
    remote_sync: RemoteSync = Depends(get_remote_sync)
):
    """Получить информацию об удаленном хранилище"""
    try:
        info = await remote_sync.get_remote_info(remote_name)
        if "error" in info:
            raise HTTPException(status_code=404, detail=info["error"])
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/to", response_model=Dict[str, Any])
async def sync_to_remote(
    config: SyncConfig,
    remote_sync: RemoteSync = Depends(get_remote_sync)
):
    """Синхронизировать локальные файлы с удаленным хранилищем"""
    try:
        result = await remote_sync.sync_to_remote(
            config.remote_name,
            config.local_path,
            config.remote_path,
            config.exclude
        )
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/from", response_model=Dict[str, Any])
async def sync_from_remote(
    config: SyncConfig,
    remote_sync: RemoteSync = Depends(get_remote_sync)
):
    """Синхронизировать файлы из удаленного хранилища"""
    try:
        result = await remote_sync.sync_from_remote(
            config.remote_name,
            config.remote_path,
            config.local_path,
            config.exclude
        )
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add", response_model=Dict[str, Any])
async def add_remote(
    config: RemoteConfig,
    remote_sync: RemoteSync = Depends(get_remote_sync)
):
    """Добавить новое удаленное хранилище"""
    try:
        result = await remote_sync.add_remote(
            config.name,
            config.type,
            config.config
        )
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/remove/{remote_name}", response_model=Dict[str, Any])
async def remove_remote(
    remote_name: str,
    remote_sync: RemoteSync = Depends(get_remote_sync)
):
    """Удалить удаленное хранилище"""
    try:
        result = await remote_sync.remove_remote(remote_name)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 