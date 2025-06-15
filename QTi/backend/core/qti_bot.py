import asyncio
import json
import os
import subprocess
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..logger import bot_logger, log_extra

class QTiBot:
    """Основной класс для управления торговым ботом"""
    
    def __init__(self, config_path: str):
        """Инициализация бота
        
        Args:
            config_path: Путь к конфигурационному файлу бота
        """
        self.config_path = config_path
        self.process: Optional[subprocess.Popen] = None
        self.start_time: Optional[datetime] = None
        self.config: Dict[str, Any] = {}
        self.status: str = "stopped"
        self.pid: Optional[int] = None
        self.uptime: float = 0.0
        self.profit: float = 0.0
        
        bot_logger.info(
            "QTiBot initialized",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
        self._load_config()
        
    def _load_config(self) -> None:
        """Загрузка конфигурации бота"""
        try:
            bot_logger.debug(
                "Loading bot configuration",
                extra=log_extra({"config_path": self.config_path})
            )
            
            with open(self.config_path, "r") as f:
                self.config = json.load(f)
                
            bot_logger.info(
                "Bot configuration loaded",
                extra=log_extra({
                    "config_path": self.config_path,
                    "config_keys": list(self.config.keys())
                })
            )
        except Exception as e:
            bot_logger.error(
                "Error loading bot configuration",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    async def start(self) -> bool:
        """Запуск бота
        
        Returns:
            bool: True если бот успешно запущен, False в противном случае
        """
        if self.status == "running":
            bot_logger.warning(
                "Bot is already running",
                extra=log_extra({"config_path": self.config_path})
            )
            return False
            
        try:
            bot_logger.info(
                "Starting bot",
                extra=log_extra({
                    "config_path": self.config_path,
                    "config": self.config
                })
            )
            
            # Запускаем процесс бота
            self.process = subprocess.Popen(
                [
                    "python",
                    "-m",
                    "passivbot",
                    "--config",
                    self.config_path,
                    "--exchange",
                    self.config.get("exchange", ""),
                    "--symbol",
                    self.config.get("symbol", "")
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.pid = self.process.pid
            self.start_time = datetime.now()
            self.status = "running"
            
            bot_logger.info(
                "Bot started successfully",
                extra=log_extra({
                    "config_path": self.config_path,
                    "pid": self.pid,
                    "start_time": self.start_time.isoformat()
                })
            )
            
            # Запускаем мониторинг
            asyncio.create_task(self._monitor())
            
            return True
            
        except Exception as e:
            bot_logger.error(
                "Error starting bot",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            self.status = "error"
            return False
            
    async def stop(self) -> bool:
        """Остановка бота
        
        Returns:
            bool: True если бот успешно остановлен, False в противном случае
        """
        if self.status != "running":
            bot_logger.warning(
                "Bot is not running",
                extra=log_extra({"config_path": self.config_path})
            )
            return False
            
        try:
            bot_logger.info(
                "Stopping bot",
                extra=log_extra({
                    "config_path": self.config_path,
                    "pid": self.pid
                })
            )
            
            if self.process:
                self.process.terminate()
                await asyncio.sleep(1)
                if self.process.poll() is None:
                    self.process.kill()
                    
            self.status = "stopped"
            self.pid = None
            self.start_time = None
            self.uptime = 0.0
            
            bot_logger.info(
                "Bot stopped successfully",
                extra=log_extra({"config_path": self.config_path})
            )
            
            return True
            
        except Exception as e:
            bot_logger.error(
                "Error stopping bot",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            return False
            
    async def get_status(self) -> Dict[str, Any]:
        """Получение статуса бота
        
        Returns:
            Dict[str, Any]: Словарь с информацией о статусе бота
        """
        if self.status == "running" and self.start_time:
            self.uptime = (datetime.now() - self.start_time).total_seconds()
            
        status = {
            "status": self.status,
            "pid": self.pid,
            "uptime": self.uptime,
            "profit": self.profit
        }
        
        bot_logger.debug(
            "Bot status retrieved",
            extra=log_extra({
                "config_path": self.config_path,
                "status": status
            })
        )
        
        return status
        
    async def update_config(self, config: Dict[str, Any]) -> bool:
        """Обновление конфигурации бота
        
        Args:
            config: Новая конфигурация бота
            
        Returns:
            bool: True если конфигурация успешно обновлена, False в противном случае
        """
        try:
            bot_logger.info(
                "Updating bot configuration",
                extra=log_extra({
                    "config_path": self.config_path,
                    "new_config": config
                })
            )
            
            # Сохраняем новую конфигурацию
            with open(self.config_path, "w") as f:
                json.dump(config, f, indent=2)
                
            self.config = config
            
            bot_logger.info(
                "Bot configuration updated successfully",
                extra=log_extra({"config_path": self.config_path})
            )
            
            return True
            
        except Exception as e:
            bot_logger.error(
                "Error updating bot configuration",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            return False
            
    async def get_logs(self, limit: int = 100, level: Optional[str] = None) -> List[str]:
        """Получение логов бота
        
        Args:
            limit: Максимальное количество строк логов
            level: Уровень логирования (debug, info, warning, error)
            
        Returns:
            List[str]: Список строк логов
        """
        try:
            bot_logger.debug(
                "Getting bot logs",
                extra=log_extra({
                    "config_path": self.config_path,
                    "limit": limit,
                    "level": level
                })
            )
            
            # TODO: Реализовать получение логов из файла или базы данных
            logs = []
            
            bot_logger.debug(
                "Bot logs retrieved",
                extra=log_extra({
                    "config_path": self.config_path,
                    "log_count": len(logs)
                })
            )
            
            return logs
            
        except Exception as e:
            bot_logger.error(
                "Error getting bot logs",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            return []
            
    async def _monitor(self) -> None:
        """Мониторинг работы бота"""
        bot_logger.info(
            "Starting bot monitoring",
            extra=log_extra({
                "config_path": self.config_path,
                "pid": self.pid
            })
        )
        
        try:
            while self.process and self.process.poll() is None:
                # Читаем stdout
                stdout = self.process.stdout.readline()
                if stdout:
                    bot_logger.debug(
                        "Bot stdout",
                        extra=log_extra({
                            "config_path": self.config_path,
                            "output": stdout.decode().strip()
                        })
                    )
                    
                # Читаем stderr
                stderr = self.process.stderr.readline()
                if stderr:
                    bot_logger.warning(
                        "Bot stderr",
                        extra=log_extra({
                            "config_path": self.config_path,
                            "error": stderr.decode().strip()
                        })
                    )
                    
                await asyncio.sleep(0.1)
                
            if self.process:
                exit_code = self.process.returncode
                bot_logger.warning(
                    "Bot process terminated unexpectedly",
                    extra=log_extra({
                        "config_path": self.config_path,
                        "exit_code": exit_code
                    })
                )
                
                self.status = "stopped"
                self.pid = None
                self.start_time = None
                self.uptime = 0.0
                
        except Exception as e:
            bot_logger.error(
                "Error in bot monitoring",
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise 