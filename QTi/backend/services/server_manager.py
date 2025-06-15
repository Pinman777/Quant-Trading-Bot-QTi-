import asyncio
import json
import os
import subprocess
from typing import Dict, Any
import logging
import asyncssh
from ..models import Server

logger = logging.getLogger(__name__)

class ServerManager:
    def __init__(self):
        self.config_dir = os.path.join(os.path.dirname(__file__), "../../config")
        os.makedirs(self.config_dir, exist_ok=True)

    async def test_connection(self, server: Server) -> Dict[str, Any]:
        """Test SSH connection to server"""
        try:
            async with asyncssh.connect(
                server.host,
                port=server.port,
                username=server.username,
                password=server.password,
                known_hosts=None
            ) as conn:
                # Test basic command
                result = await conn.run("echo 'Connection successful'")
                return {
                    "status": "success",
                    "output": result.stdout
                }
        except Exception as e:
            logger.error(f"Failed to connect to server {server.id}: {str(e)}")
            raise

    async def sync_server(self, server: Server) -> Dict[str, Any]:
        """Sync files with server using rclone"""
        try:
            # Create rclone config
            config_path = os.path.join(self.config_dir, f"rclone_{server.id}.conf")
            with open(config_path, "w") as f:
                f.write(server.rclone_config)

            # Run rclone sync
            process = await asyncio.create_subprocess_exec(
                "rclone",
                "sync",
                "local:",
                f"remote_{server.id}:",
                "--config", config_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise Exception(f"Rclone sync failed: {stderr.decode()}")

            # Clean up config
            if os.path.exists(config_path):
                os.remove(config_path)

            return {
                "status": "success",
                "output": stdout.decode()
            }

        except Exception as e:
            logger.error(f"Failed to sync server {server.id}: {str(e)}")
            raise

    async def execute_command(self, server: Server, command: str) -> Dict[str, Any]:
        """Execute command on server"""
        try:
            async with asyncssh.connect(
                server.host,
                port=server.port,
                username=server.username,
                password=server.password,
                known_hosts=None
            ) as conn:
                result = await conn.run(command)
                return {
                    "status": "success",
                    "output": result.stdout,
                    "error": result.stderr
                }
        except Exception as e:
            logger.error(f"Failed to execute command on server {server.id}: {str(e)}")
            raise

    async def get_server_status(self, server: Server) -> Dict[str, Any]:
        """Get server status and resource usage"""
        try:
            async with asyncssh.connect(
                server.host,
                port=server.port,
                username=server.username,
                password=server.password,
                known_hosts=None
            ) as conn:
                # Get CPU usage
                cpu_result = await conn.run("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'")
                cpu_usage = float(cpu_result.stdout.strip())

                # Get memory usage
                mem_result = await conn.run("free -m | grep Mem | awk '{print $3/$2 * 100.0}'")
                mem_usage = float(mem_result.stdout.strip())

                # Get disk usage
                disk_result = await conn.run("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'")
                disk_usage = float(disk_result.stdout.strip())

                return {
                    "status": "success",
                    "cpu_usage": cpu_usage,
                    "memory_usage": mem_usage,
                    "disk_usage": disk_usage
                }
        except Exception as e:
            logger.error(f"Failed to get server status {server.id}: {str(e)}")
            raise 