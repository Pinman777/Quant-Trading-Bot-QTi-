import asyncio
import json
import os
import subprocess
import cProfile
import pstats
from typing import Dict, Any, List, Optional
from datetime import datetime
from ..models import Bot
from ..core.config import settings
from ..core.qti_bot import QTiBotManager
from ..logger import bot_logger, log_extra

class BotManager:
    def __init__(self):
        self.bots: Dict[str, QTiBotManager] = {}
        self.profiler = cProfile.Profile()
        self.running_bots: Dict[int, asyncio.Task] = {}
        self.bot_processes: Dict[int, subprocess.Popen] = {}
        self.config_dir = os.path.join(os.path.dirname(__file__), "../../config")
        os.makedirs(self.config_dir, exist_ok=True)
        bot_logger.info(
            "BotManager initialized",
            extra=log_extra({"config_dir": self.config_dir})
        )

    async def initialize_bots(self) -> None:
        """Инициализация ботов"""
        try:
            bot_logger.info("Initializing bots")
            bot_configs = await self._load_bot_configs()
            for config in bot_configs:
                bot = QTiBotManager(config["path"])
                self.bots[config["name"]] = bot
                bot_logger.info(
                    "Bot initialized",
                    extra=log_extra({
                        "bot_name": config["name"],
                        "config_path": config["path"]
                    })
                )
        except Exception as e:
            bot_logger.error(
                "Error initializing bots",
                extra=log_extra({"error": str(e)})
            )
            raise
            
    async def _load_bot_configs(self) -> List[Dict[str, Any]]:
        """Загрузка конфигураций ботов"""
        try:
            bot_logger.debug(
                "Loading bot configurations",
                extra=log_extra({"config_path": settings.BOT_CONFIG_PATH})
            )
            with open(settings.BOT_CONFIG_PATH, "r") as f:
                configs = json.load(f)
            bot_logger.info(
                "Bot configurations loaded",
                extra=log_extra({"config_count": len(configs)})
            )
            return configs
        except Exception as e:
            bot_logger.error(
                "Error loading bot configs",
                extra=log_extra({
                    "config_path": settings.BOT_CONFIG_PATH,
                    "error": str(e)
                })
            )
            return []
            
    async def start_bot(self, bot_name: str) -> bool:
        """Запуск бота с профилированием"""
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        bot_logger.info(
            "Starting bot with profiling",
            extra=log_extra({"bot_name": bot_name})
        )
        
        self.profiler.enable()
        try:
            success = await self.bots[bot_name].start()
            if success:
                bot_logger.info(
                    "Bot started successfully",
                    extra=log_extra({"bot_name": bot_name})
                )
            else:
                bot_logger.warning(
                    "Bot failed to start",
                    extra=log_extra({"bot_name": bot_name})
                )
            return success
        except Exception as e:
            bot_logger.error(
                "Error starting bot",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            raise
        finally:
            self.profiler.disable()
            stats = pstats.Stats(self.profiler)
            stats.sort_stats("cumulative")
            stats.print_stats()
            
    async def stop_bot(self, bot_name: str) -> bool:
        """Остановка бота"""
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        bot_logger.info(
            "Stopping bot",
            extra=log_extra({"bot_name": bot_name})
        )
        
        try:
            success = await self.bots[bot_name].stop()
            if success:
                bot_logger.info(
                    "Bot stopped successfully",
                    extra=log_extra({"bot_name": bot_name})
                )
            else:
                bot_logger.warning(
                    "Bot failed to stop",
                    extra=log_extra({"bot_name": bot_name})
                )
            return success
        except Exception as e:
            bot_logger.error(
                "Error stopping bot",
                extra=log_extra({
                    "bot_name": bot_name,
                    "error": str(e)
                })
            )
            return False
            
    async def get_bot_status(self, bot_name: str) -> Dict[str, Any]:
        """Получение статуса бота"""
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        bot_logger.debug(
            "Getting bot status",
            extra=log_extra({"bot_name": bot_name})
        )
        
        try:
            status = await self.bots[bot_name].get_status()
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
            return {}
            
    async def get_all_bot_statuses(self) -> Dict[str, Dict[str, Any]]:
        """Получение статусов всех ботов асинхронно"""
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
        
    async def update_bot_config(self, bot_name: str, config: Dict[str, Any]) -> bool:
        """Обновление конфигурации бота"""
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        bot_logger.info(
            "Updating bot configuration",
            extra=log_extra({
                "bot_name": bot_name,
                "config": config
            })
        )
        
        try:
            success = await self.bots[bot_name].update_config(config)
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
            return False
            
    async def get_bot_logs(
        self,
        bot_name: str,
        limit: int = 100,
        level: Optional[str] = None
    ) -> List[str]:
        """Получение логов бота"""
        if bot_name not in self.bots:
            bot_logger.error(
                "Bot not found",
                extra=log_extra({"bot_name": bot_name})
            )
            raise ValueError(f"Bot {bot_name} not found")
            
        bot_logger.debug(
            "Getting bot logs",
            extra=log_extra({
                "bot_name": bot_name,
                "limit": limit,
                "level": level
            })
        )
        
        try:
            logs = await self.bots[bot_name].get_logs(limit, level)
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
            return []
            
    async def get_all_bot_logs(
        self,
        limit: int = 100,
        level: Optional[str] = None
    ) -> Dict[str, List[str]]:
        """Получение логов всех ботов асинхронно"""
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

    async def start_bot_instance(self, bot: Bot) -> None:
        """Start a bot instance"""
        if bot.id in self.running_bots:
            bot_logger.error(
                "Bot is already running",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name
                })
            )
            raise ValueError("Bot is already running")

        bot_logger.info(
            "Starting bot instance",
            extra=log_extra({
                "bot_id": bot.id,
                "bot_name": bot.name,
                "exchange": bot.exchange,
                "symbol": bot.symbol
            })
        )

        # Create config file
        config_path = os.path.join(self.config_dir, f"bot_{bot.id}.json")
        with open(config_path, "w") as f:
            json.dump(bot.config, f, indent=2)

        bot_logger.debug(
            "Bot configuration file created",
            extra=log_extra({
                "bot_id": bot.id,
                "config_path": config_path
            })
        )

        # Start bot process
        try:
            process = subprocess.Popen(
                [
                    "python",
                    "-m",
                    "passivbot",
                    "--config",
                    config_path,
                    "--exchange",
                    bot.exchange,
                    "--symbol",
                    bot.symbol
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.bot_processes[bot.id] = process

            bot_logger.info(
                "Bot process started",
                extra=log_extra({
                    "bot_id": bot.id,
                    "pid": process.pid
                })
            )

            # Start monitoring task
            monitor_task = asyncio.create_task(
                self._monitor_bot(bot.id, process)
            )
            self.running_bots[bot.id] = monitor_task

            bot_logger.info(
                "Bot monitoring task started",
                extra=log_extra({
                    "bot_id": bot.id,
                    "task_id": id(monitor_task)
                })
            )

        except Exception as e:
            bot_logger.error(
                "Failed to start bot",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name,
                    "error": str(e)
                })
            )
            raise

    async def stop_bot_instance(self, bot: Bot) -> None:
        """Stop a bot instance"""
        if bot.id not in self.running_bots:
            bot_logger.error(
                "Bot is not running",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name
                })
            )
            raise ValueError("Bot is not running")

        bot_logger.info(
            "Stopping bot instance",
            extra=log_extra({
                "bot_id": bot.id,
                "bot_name": bot.name
            })
        )

        try:
            # Stop monitoring task
            self.running_bots[bot.id].cancel()
            del self.running_bots[bot.id]

            bot_logger.debug(
                "Bot monitoring task cancelled",
                extra=log_extra({"bot_id": bot.id})
            )

            # Stop bot process
            process = self.bot_processes[bot.id]
            process.terminate()
            await asyncio.sleep(1)
            if process.poll() is None:
                process.kill()
            del self.bot_processes[bot.id]

            bot_logger.info(
                "Bot process terminated",
                extra=log_extra({
                    "bot_id": bot.id,
                    "exit_code": process.returncode
                })
            )

            # Clean up config file
            config_path = os.path.join(self.config_dir, f"bot_{bot.id}.json")
            if os.path.exists(config_path):
                os.remove(config_path)
                bot_logger.debug(
                    "Bot configuration file removed",
                    extra=log_extra({
                        "bot_id": bot.id,
                        "config_path": config_path
                    })
                )

        except Exception as e:
            bot_logger.error(
                "Error stopping bot instance",
                extra=log_extra({
                    "bot_id": bot.id,
                    "bot_name": bot.name,
                    "error": str(e)
                })
            )
            raise

    async def _monitor_bot(self, bot_id: int, process: subprocess.Popen) -> None:
        """Monitor bot process"""
        bot_logger.info(
            "Starting bot monitoring",
            extra=log_extra({
                "bot_id": bot_id,
                "pid": process.pid
            })
        )

        try:
            while True:
                if process.poll() is not None:
                    exit_code = process.returncode
                    bot_logger.warning(
                        "Bot process terminated unexpectedly",
                        extra=log_extra({
                            "bot_id": bot_id,
                            "exit_code": exit_code
                        })
                    )
                    break

                # Read output
                stdout = process.stdout.readline()
                if stdout:
                    bot_logger.debug(
                        "Bot stdout",
                        extra=log_extra({
                            "bot_id": bot_id,
                            "output": stdout.decode().strip()
                        })
                    )

                stderr = process.stderr.readline()
                if stderr:
                    bot_logger.warning(
                        "Bot stderr",
                        extra=log_extra({
                            "bot_id": bot_id,
                            "error": stderr.decode().strip()
                        })
                    )

                await asyncio.sleep(0.1)

        except asyncio.CancelledError:
            bot_logger.info(
                "Bot monitoring cancelled",
                extra=log_extra({"bot_id": bot_id})
            )
            raise
        except Exception as e:
            bot_logger.error(
                "Error in bot monitoring",
                extra=log_extra({
                    "bot_id": bot_id,
                    "error": str(e)
                })
            )
            raise

    def get_bot_status_instance(self, bot_id: int) -> Optional[str]:
        """Get bot status"""
        if bot_id in self.running_bots:
            return "running"
        return "stopped"

    def get_bot_process(self, bot_id: int) -> Optional[subprocess.Popen]:
        """Get bot process"""
        return self.bot_processes.get(bot_id) 