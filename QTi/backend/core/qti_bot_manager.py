import asyncio
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from .qti_bot import QTiBot
from ..logger import bot_logger, log_extra

class QTiBotManager:
    """Менеджер для управления несколькими ботами"""
    
    def __init__(self, config_dir: str):
        """Инициализация менеджера ботов
        
        Args:
            config_dir: Директория с конфигурационными файлами ботов
        """
        self.config_dir = config_dir
        self.bots: Dict[str, QTiBot] = {}
        
        bot_logger.info(
            "QTiBotManager initialized",
            extra=log_extra({"config_dir": config_dir})
        )
        
        # Создаем директорию для конфигураций, если она не существует
        os.makedirs(config_dir, exist_ok=True)
        
    async def initialize(self) -> None:
        """Инициализация всех ботов из конфигурационной директории"""
        try:
            bot_logger.info(
                "Initializing bots from config directory",
                extra=log_extra({"config_dir": self.config_dir})
            )
            
            # Загружаем все конфигурационные файлы
            for filename in os.listdir(self.config_dir):
                if filename.endswith(".json"):
                    config_path = os.path.join(self.config_dir, filename)
                    bot_name = os.path.splitext(filename)[0]
                    
                    try:
                        bot = QTiBot(config_path)
                        self.bots[bot_name] = bot
                        bot_logger.info(
                            "Bot initialized",
                            extra=log_extra({
                                "bot_name": bot_name,
                                "config_path": config_path
                            })
                        )
                    except Exception as e:
                        bot_logger.error(
                            "Error initializing bot",
                            extra=log_extra({
                                "bot_name": bot_name,
                                "config_path": config_path,
                                "error": str(e)
                            })
                        )
                        
        except Exception as e:
            bot_logger.error(
                "Error initializing bots",
                extra=log_extra({
                    "config_dir": self.config_dir,
                    "error": str(e)
                })
            )
            raise
            
    async def start_bot(self, bot_name: str, config_path: str) -> Dict[str, Any]:
        """Запуск бота
        
        Args:
            bot_name: Имя бота
            config_path: Путь к конфигурационному файлу
            
        Returns:
            Dict[str, Any]: Статус бота после запуска
        """
        try:
            bot_logger.info(
                "Starting bot",
                extra=log_extra({
                    "bot_name": bot_name,
                    "config_path": config_path
                })
            )
            
            # Создаем или обновляем бота
            if bot_name in self.bots:
                bot = self.bots[bot_name]
                await bot.update_config(json.load(open(config_path)))
            else:
                bot = QTiBot(config_path)
                self.bots[bot_name] = bot
                
            # Запускаем бота
            success = await bot.start()
            if not success:
                bot_logger.error(
                    "Failed to start bot",
                    extra=log_extra({
                        "bot_name": bot_name,
                        "config_path": config_path
                    })
                )
                raise Exception("Failed to start bot")
                
            # Получаем статус бота
            status = await bot.get_status()
            
            bot_logger.info(
                "Bot started successfully",
                extra=log_extra({
                    "bot_name": bot_name,
                    "status": status
                })
            )
            
            return status
            
        except Exception as e:
            bot_logger.error(
                "Error starting bot",
                extra=log_extra({
                    "bot_name": bot_name,
                    "config_path": config_path,
                    "error": str(e)
                })
            )
            raise
            
    async def stop_bot(self, bot_name: str) -> Dict[str, Any]:
        """Остановка бота
        
        Args:
            bot_name: Имя бота
            
        Returns:
            Dict[str, Any]: Статус бота после остановки
        """
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        try:
            bot_logger.info(
                "Stopping bot",
                extra=log_extra({"bot_name": bot_name})
            )
            
            bot = self.bots[bot_name]
            success = await bot.stop()
            
            if not success:
                bot_logger.error(
                    "Failed to stop bot",
                    extra=log_extra({"bot_name": bot_name})
                )
                raise Exception("Failed to stop bot")
                
            # Получаем статус бота
            status = await bot.get_status()
            
            bot_logger.info(
                "Bot stopped successfully",
                extra=log_extra({
                    "bot_name": bot_name,
                    "status": status
                })
            )
            
            return status
            
        except Exception as e:
            bot_logger.error(
                "Error stopping bot",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            raise
            
    async def get_bot_status(self, bot_name: str) -> Dict[str, Any]:
        """Получение статуса бота
        
        Args:
            bot_name: Имя бота
            
        Returns:
            Dict[str, Any]: Статус бота
        """
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        try:
            bot_logger.debug(
                "Getting bot status",
                extra=log_extra({"bot_name": bot_name})
            )
            
            bot = self.bots[bot_name]
            status = await bot.get_status()
            
            bot_logger.debug(
                "Bot status retrieved",
                extra=log_extra({
                    "bot_name": bot_name,
                    "status": status
                })
            )
            
            return status
            
        except Exception as e:
            bot_logger.error(
                "Error getting bot status",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            raise
            
    async def get_all_bot_statuses(self) -> Dict[str, Dict[str, Any]]:
        """Получение статусов всех ботов
        
        Returns:
            Dict[str, Dict[str, Any]]: Словарь статусов ботов
        """
        try:
            bot_logger.debug("Getting statuses for all bots")
            
            tasks = []
            for bot_name in self.bots:
                tasks.append(self.get_bot_status(bot_name))
                
            statuses = await asyncio.gather(*tasks, return_exceptions=True)
            result = {
                bot_name: status if not isinstance(status, Exception) else {}
                for bot_name, status in zip(self.bots.keys(), statuses)
            }
            
            bot_logger.debug(
                "All bot statuses retrieved",
                extra=log_extra({"statuses": result})
            )
            
            return result
            
        except Exception as e:
            bot_logger.error(
                "Error getting all bot statuses",
                extra=log_extra({"error": str(e)})
            )
            raise
            
    async def update_bot_config(self, bot_name: str, config: Dict[str, Any]) -> bool:
        """Обновление конфигурации бота
        
        Args:
            bot_name: Имя бота
            config: Новая конфигурация
            
        Returns:
            bool: True если конфигурация успешно обновлена, False в противном случае
        """
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        try:
            bot_logger.info(
                "Updating bot configuration",
                extra=log_extra({
                    "bot_name": bot_name,
                    "config": config
                })
            )
            
            bot = self.bots[bot_name]
            success = await bot.update_config(config)
            
            if success:
                bot_logger.info(
                    "Bot configuration updated successfully",
                    extra=log_extra({"bot_name": bot_name})
                )
            else:
                bot_logger.warning(
                    "Failed to update bot configuration",
                    extra=log_extra({"bot_name": bot_name})
                )
                
            return success
            
        except Exception as e:
            bot_logger.error(
                "Error updating bot configuration",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            raise
            
    async def get_bot_logs(
        self,
        bot_name: str,
        limit: int = 100,
        level: Optional[str] = None
    ) -> List[str]:
        """Получение логов бота
        
        Args:
            bot_name: Имя бота
            limit: Максимальное количество строк логов
            level: Уровень логирования (debug, info, warning, error)
            
        Returns:
            List[str]: Список строк логов
        """
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        try:
            bot_logger.debug(
                "Getting bot logs",
                extra=log_extra({
                    "bot_name": bot_name,
                    "limit": limit,
                    "level": level
                })
            )
            
            bot = self.bots[bot_name]
            logs = await bot.get_logs(limit, level)
            
            bot_logger.debug(
                "Bot logs retrieved",
                extra=log_extra({
                    "bot_name": bot_name,
                    "log_count": len(logs)
                })
            )
            
            return logs
            
        except Exception as e:
            bot_logger.error(
                "Error getting bot logs",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            raise
            
    async def get_all_bot_logs(
        self,
        limit: int = 100,
        level: Optional[str] = None
    ) -> Dict[str, List[str]]:
        """Получение логов всех ботов
        
        Args:
            limit: Максимальное количество строк логов
            level: Уровень логирования (debug, info, warning, error)
            
        Returns:
            Dict[str, List[str]]: Словарь логов ботов
        """
        try:
            bot_logger.debug(
                "Getting logs for all bots",
                extra=log_extra({
                    "limit": limit,
                    "level": level
                })
            )
            
            tasks = []
            for bot_name in self.bots:
                tasks.append(self.get_bot_logs(bot_name, limit, level))
                
            logs = await asyncio.gather(*tasks, return_exceptions=True)
            result = {
                bot_name: log if not isinstance(log, Exception) else []
                for bot_name, log in zip(self.bots.keys(), logs)
            }
            
            bot_logger.debug(
                "All bot logs retrieved",
                extra=log_extra({
                    "bot_count": len(result),
                    "total_logs": sum(len(logs) for logs in result.values())
                })
            )
            
            return result
            
        except Exception as e:
            bot_logger.error(
                "Error getting all bot logs",
                extra=log_extra({"error": str(e)})
            )
            raise 