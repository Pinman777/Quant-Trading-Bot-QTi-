import json
import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import shutil
from datetime import datetime

class ConfigManager:
    def __init__(self, config_dir: str = "configs"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(exist_ok=True)
        self.config_file = self.config_dir / "qti.ini"
        self._load_config()

    def _load_config(self) -> None:
        """Загрузка конфигурации из файла"""
        if self.config_file.exists():
            with open(self.config_file, "r") as f:
                self.config = json.load(f)
        else:
            self.config = {
                "default_configs": {},
                "remote_servers": [],
                "api_keys": {},
                "settings": {
                    "theme": "light",
                    "language": "ru",
                    "update_interval": 5,
                }
            }
            self._save_config()

    def _save_config(self) -> None:
        """Сохранение конфигурации в файл"""
        with open(self.config_file, "w") as f:
            json.dump(self.config, f, indent=4)

    def get_config(self, name: str) -> Optional[Dict[str, Any]]:
        """Получение конфигурации по имени"""
        return self.config["default_configs"].get(name)

    def save_config(self, name: str, config_data: Dict[str, Any]) -> None:
        """Сохранение конфигурации"""
        self.config["default_configs"][name] = config_data
        self._save_config()

    def delete_config(self, name: str) -> bool:
        """Удаление конфигурации"""
        if name in self.config["default_configs"]:
            del self.config["default_configs"][name]
            self._save_config()
            return True
        return False

    def list_configs(self) -> List[str]:
        """Получение списка всех конфигураций"""
        return list(self.config["default_configs"].keys())

    def get_config_content(self, name: str) -> Optional[str]:
        """Получение содержимого конфигурационного файла"""
        config = self.get_config(name)
        if config and "path" in config:
            try:
                with open(config["path"], "r") as f:
                    return f.read()
            except Exception:
                return None
        return None

    def save_config_content(self, name: str, content: str) -> bool:
        """Сохранение содержимого конфигурационного файла"""
        config = self.get_config(name)
        if config and "path" in config:
            try:
                # Создаем резервную копию
                backup_path = f"{config['path']}.{datetime.now().strftime('%Y%m%d_%H%M%S')}.bak"
                shutil.copy2(config["path"], backup_path)

                # Сохраняем новое содержимое
                with open(config["path"], "w") as f:
                    f.write(content)
                return True
            except Exception:
                return False
        return False

    def validate_config(self, content: str) -> bool:
        """Валидация конфигурации"""
        try:
            json.loads(content)
            return True
        except json.JSONDecodeError:
            return False

    def get_settings(self) -> Dict[str, Any]:
        """Получение настроек приложения"""
        return self.config["settings"]

    def update_settings(self, settings: Dict[str, Any]) -> None:
        """Обновление настроек приложения"""
        self.config["settings"].update(settings)
        self._save_config()

    def get_api_keys(self) -> Dict[str, str]:
        """Получение API ключей"""
        return self.config["api_keys"]

    def update_api_keys(self, api_keys: Dict[str, str]) -> None:
        """Обновление API ключей"""
        self.config["api_keys"] = api_keys
        self._save_config()

    def get_remote_servers(self) -> List[Dict[str, Any]]:
        """Получение списка удаленных серверов"""
        return self.config["remote_servers"]

    def add_remote_server(self, server: Dict[str, Any]) -> None:
        """Добавление удаленного сервера"""
        self.config["remote_servers"].append(server)
        self._save_config()

    def remove_remote_server(self, server_name: str) -> bool:
        """Удаление удаленного сервера"""
        for i, server in enumerate(self.config["remote_servers"]):
            if server["name"] == server_name:
                del self.config["remote_servers"][i]
                self._save_config()
                return True
        return False

    def update_remote_server(self, server_name: str, server_data: Dict[str, Any]) -> bool:
        """Обновление данных удаленного сервера"""
        for i, server in enumerate(self.config["remote_servers"]):
            if server["name"] == server_name:
                self.config["remote_servers"][i].update(server_data)
                self._save_config()
                return True
        return False 