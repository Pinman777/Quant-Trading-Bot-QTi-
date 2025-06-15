import os
import json
import uuid
import paramiko
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException
from ..schemas.server import Server, ServerCreate, ServerUpdate

class ServerService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '../data/servers')
        os.makedirs(self.data_dir, exist_ok=True)
        self.servers_file = os.path.join(self.data_dir, 'servers.json')
        self._load_servers()

    def _load_servers(self) -> None:
        if os.path.exists(self.servers_file):
            with open(self.servers_file, 'r') as f:
                self.servers = json.load(f)
        else:
            self.servers = {}
            self._save_servers()

    def _save_servers(self) -> None:
        with open(self.servers_file, 'w') as f:
            json.dump(self.servers, f, default=str)

    def _get_server_path(self, server_id: str) -> str:
        return os.path.join(self.data_dir, f'{server_id}.json')

    def get_servers(self) -> List[Server]:
        return [Server(**server) for server in self.servers.values()]

    def get_server(self, server_id: str) -> Server:
        if server_id not in self.servers:
            raise HTTPException(status_code=404, detail="Server not found")
        return Server(**self.servers[server_id])

    def add_server(self, server: ServerCreate) -> Server:
        server_id = str(uuid.uuid4())
        now = datetime.now()
        
        new_server = Server(
            id=server_id,
            **server.dict(),
            status='offline',
            last_sync=now,
            created_at=now,
            updated_at=now
        )
        
        self.servers[server_id] = new_server.dict()
        self._save_servers()
        return new_server

    def update_server(self, server_id: str, server: ServerUpdate) -> Server:
        if server_id not in self.servers:
            raise HTTPException(status_code=404, detail="Server not found")
        
        current_server = self.servers[server_id]
        update_data = server.dict(exclude_unset=True)
        
        for key, value in update_data.items():
            current_server[key] = value
        
        current_server['updated_at'] = datetime.now()
        self.servers[server_id] = current_server
        self._save_servers()
        
        return Server(**current_server)

    def delete_server(self, server_id: str) -> None:
        if server_id not in self.servers:
            raise HTTPException(status_code=404, detail="Server not found")
        
        del self.servers[server_id]
        self._save_servers()

    def check_server_status(self, server_id: str) -> str:
        server = self.get_server(server_id)
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                hostname=server.host,
                username=server.username,
                timeout=5
            )
            ssh.close()
            return 'online'
        except Exception:
            return 'offline'

    def sync_server(self, server_id: str) -> None:
        server = self.get_server(server_id)
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                hostname=server.host,
                username=server.username
            )
            
            # Create remote directory if it doesn't exist
            ssh.exec_command(f'mkdir -p {server.config_path}')
            
            # Sync local configs to remote server
            sftp = ssh.open_sftp()
            local_config_dir = os.path.join(os.path.dirname(__file__), '../configs')
            
            for root, _, files in os.walk(local_config_dir):
                for file in files:
                    local_path = os.path.join(root, file)
                    remote_path = os.path.join(
                        server.config_path,
                        os.path.relpath(local_path, local_config_dir)
                    )
                    sftp.put(local_path, remote_path)
            
            sftp.close()
            ssh.close()
            
            # Update last sync time
            self.servers[server_id]['last_sync'] = datetime.now()
            self._save_servers()
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def refresh_server(self, server_id: str) -> Server:
        server = self.get_server(server_id)
        status = self.check_server_status(server_id)
        
        self.servers[server_id]['status'] = status
        self.servers[server_id]['updated_at'] = datetime.now()
        self._save_servers()
        
        return Server(**self.servers[server_id])

server_service = ServerService() 