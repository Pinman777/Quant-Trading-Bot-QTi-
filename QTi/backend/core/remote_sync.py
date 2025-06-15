import subprocess
import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import asyncio
import aiofiles
import os

logger = logging.getLogger(__name__)

class RemoteSync:
    def __init__(self, config_path: str = "~/.config/rclone/rclone.conf"):
        self.config_path = os.path.expanduser(config_path)
        self._check_rclone_installation()

    def _check_rclone_installation(self) -> None:
        """Проверяет наличие rclone"""
        try:
            subprocess.run(["rclone", "version"], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при проверке rclone: {e}")
            raise RuntimeError("rclone не установлен или не настроен правильно")

    async def list_remotes(self) -> List[Dict[str, Any]]:
        """Получает список удаленных хранилищ"""
        try:
            result = subprocess.run(
                ["rclone", "listremotes", "--config", self.config_path],
                check=True,
                capture_output=True,
                text=True
            )
            remotes = []
            for line in result.stdout.strip().split("\n"):
                if line:
                    name = line.strip(":")
                    info = await self.get_remote_info(name)
                    remotes.append(info)
            return remotes
        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при получении списка удаленных хранилищ: {e}")
            return []

    async def get_remote_info(self, remote_name: str) -> Dict[str, Any]:
        """Получает информацию об удаленном хранилище"""
        try:
            result = subprocess.run(
                ["rclone", "about", f"{remote_name}:", "--config", self.config_path, "--json"],
                check=True,
                capture_output=True,
                text=True
            )
            info = json.loads(result.stdout)
            return {
                "name": remote_name,
                "type": info.get("type", "unknown"),
                "total": info.get("total", 0),
                "used": info.get("used", 0),
                "free": info.get("free", 0),
                "trashed": info.get("trashed", 0)
            }
        except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
            logger.error(f"Ошибка при получении информации об удаленном хранилище: {e}")
            return {
                "name": remote_name,
                "type": "unknown",
                "error": str(e)
            }

    async def sync_to_remote(
        self,
        remote_name: str,
        local_path: str,
        remote_path: str,
        exclude: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Синхронизирует локальные файлы с удаленным хранилищем"""
        try:
            cmd = [
                "rclone",
                "sync",
                local_path,
                f"{remote_name}:{remote_path}",
                "--config", self.config_path,
                "--progress",
                "--stats", "30s"
            ]
            
            if exclude:
                for pattern in exclude:
                    cmd.extend(["--exclude", pattern])

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "status": "success",
                    "message": "Синхронизация успешно завершена",
                    "details": stdout.decode()
                }
            else:
                return {
                    "status": "error",
                    "message": "Ошибка при синхронизации",
                    "error": stderr.decode()
                }
        except Exception as e:
            logger.error(f"Ошибка при синхронизации: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def sync_from_remote(
        self,
        remote_name: str,
        remote_path: str,
        local_path: str,
        exclude: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Синхронизирует файлы из удаленного хранилища"""
        try:
            cmd = [
                "rclone",
                "sync",
                f"{remote_name}:{remote_path}",
                local_path,
                "--config", self.config_path,
                "--progress",
                "--stats", "30s"
            ]
            
            if exclude:
                for pattern in exclude:
                    cmd.extend(["--exclude", pattern])

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "status": "success",
                    "message": "Синхронизация успешно завершена",
                    "details": stdout.decode()
                }
            else:
                return {
                    "status": "error",
                    "message": "Ошибка при синхронизации",
                    "error": stderr.decode()
                }
        except Exception as e:
            logger.error(f"Ошибка при синхронизации: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def add_remote(
        self,
        name: str,
        remote_type: str,
        config: Dict[str, str]
    ) -> Dict[str, Any]:
        """Добавляет новое удаленное хранилище"""
        try:
            # Создаем временный конфиг
            temp_config = Path("temp_rclone.conf")
            async with aiofiles.open(temp_config, "w") as f:
                await f.write(f"[{name}]\n")
                await f.write(f"type = {remote_type}\n")
                for key, value in config.items():
                    await f.write(f"{key} = {value}\n")

            # Добавляем в основной конфиг
            result = subprocess.run(
                ["rclone", "config", "file", "--config", str(temp_config)],
                check=True,
                capture_output=True,
                text=True
            )

            # Удаляем временный конфиг
            temp_config.unlink()

            return {
                "status": "success",
                "message": "Удаленное хранилище успешно добавлено"
            }
        except Exception as e:
            logger.error(f"Ошибка при добавлении удаленного хранилища: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    async def remove_remote(self, name: str) -> Dict[str, Any]:
        """Удаляет удаленное хранилище"""
        try:
            result = subprocess.run(
                ["rclone", "config", "delete", name, "--config", self.config_path],
                check=True,
                capture_output=True,
                text=True
            )
            return {
                "status": "success",
                "message": "Удаленное хранилище успешно удалено"
            }
        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при удалении удаленного хранилища: {e}")
            return {
                "status": "error",
                "message": str(e)
            } 