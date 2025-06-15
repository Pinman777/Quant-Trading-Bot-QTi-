import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path
import subprocess

logger = logging.getLogger(__name__)

class RemoteManager:
    def __init__(self, config_path: str = "./qti.ini"):
        self.config_path = config_path
        self.rclone_path = "rclone"
        
    async def _run_rclone(self, command: List[str]) -> Dict[str, Any]:
        """Выполнение команды rclone"""
        try:
            process = await asyncio.create_subprocess_exec(
                self.rclone_path,
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"Error running rclone: {stderr.decode()}")
                return {"error": stderr.decode()}
                
            return {"output": stdout.decode()}
        except Exception as e:
            logger.error(f"Error running rclone: {str(e)}")
            return {"error": str(e)}
            
    async def list_remotes(self) -> List[Dict[str, Any]]:
        """Получение списка удаленных серверов"""
        result = await self._run_rclone(["listremotes"])
        if "error" in result:
            return []
            
        remotes = []
        for line in result["output"].split("\n"):
            if line.strip():
                name = line.strip(":")
                config = await self._get_remote_config(name)
                remotes.append({
                    "name": name,
                    "config": config
                })
        return remotes
        
    async def _get_remote_config(self, remote: str) -> Dict[str, Any]:
        """Получение конфигурации удаленного сервера"""
        result = await self._run_rclone(["config", "show", remote])
        if "error" in result:
            return {}
            
        config = {}
        for line in result["output"].split("\n"):
            if "=" in line:
                key, value = line.split("=", 1)
                config[key.strip()] = value.strip()
        return config
        
    async def sync_remote(
        self,
        remote: str,
        source: str,
        destination: str
    ) -> Dict[str, Any]:
        """Синхронизация с удаленным сервером"""
        return await self._run_rclone([
            "sync",
            source,
            f"{remote}:{destination}",
            "--progress"
        ])
        
    async def copy_remote(
        self,
        remote: str,
        source: str,
        destination: str
    ) -> Dict[str, Any]:
        """Копирование на удаленный сервер"""
        return await self._run_rclone([
            "copy",
            source,
            f"{remote}:{destination}",
            "--progress"
        ])
        
    async def move_remote(
        self,
        remote: str,
        source: str,
        destination: str
    ) -> Dict[str, Any]:
        """Перемещение на удаленный сервер"""
        return await self._run_rclone([
            "move",
            source,
            f"{remote}:{destination}",
            "--progress"
        ])
        
    async def delete_remote(
        self,
        remote: str,
        path: str
    ) -> Dict[str, Any]:
        """Удаление с удаленного сервера"""
        return await self._run_rclone([
            "delete",
            f"{remote}:{path}"
        ])
        
    async def list_remote_files(
        self,
        remote: str,
        path: str
    ) -> List[Dict[str, Any]]:
        """Получение списка файлов на удаленном сервере"""
        result = await self._run_rclone([
            "lsjson",
            f"{remote}:{path}"
        ])
        
        if "error" in result:
            return []
            
        try:
            return json.loads(result["output"])
        except json.JSONDecodeError:
            return []
            
    async def check_remote_connection(self, remote: str) -> bool:
        """Проверка соединения с удаленным сервером"""
        result = await self._run_rclone([
            "about",
            remote
        ])
        return "error" not in result 