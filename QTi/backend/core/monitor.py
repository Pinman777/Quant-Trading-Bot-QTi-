import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np
from .config import ConfigManager

class PerformanceMetrics:
    def __init__(self):
        self.total_trades = 0
        self.winning_trades = 0
        self.losing_trades = 0
        self.total_profit = 0.0
        self.max_drawdown = 0.0
        self.current_drawdown = 0.0
        self.equity_curve = []
        self.last_update = datetime.now()

    def update(self, trade_data: Dict[str, Any]):
        """Обновление метрик на основе новых данных о сделке"""
        self.total_trades += 1
        if trade_data["pnl"] > 0:
            self.winning_trades += 1
        else:
            self.losing_trades += 1

        self.total_profit += trade_data["pnl"]
        self.equity_curve.append(self.total_profit)

        # Расчет текущей просадки
        peak = max(self.equity_curve)
        self.current_drawdown = (peak - self.total_profit) / peak if peak > 0 else 0
        self.max_drawdown = max(self.max_drawdown, self.current_drawdown)
        self.last_update = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        """Преобразование метрик в словарь"""
        return {
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "win_rate": self.winning_trades / self.total_trades if self.total_trades > 0 else 0,
            "total_profit": self.total_profit,
            "max_drawdown": self.max_drawdown,
            "current_drawdown": self.current_drawdown,
            "equity_curve": self.equity_curve,
            "last_update": self.last_update.isoformat()
        }

class Monitor:
    def __init__(self, config_manager: ConfigManager):
        self.config_manager = config_manager
        self.active_bots: Dict[str, Dict[str, Any]] = {}
        self.performance_metrics: Dict[str, PerformanceMetrics] = {}
        self.trade_history: Dict[str, List[Dict[str, Any]]] = {}

    async def start_monitoring(self, bot_name: str, config_path: str) -> bool:
        """Начало мониторинга бота"""
        if bot_name in self.active_bots:
            return False

        try:
            config = self.config_manager.load_config(config_path)
            self.active_bots[bot_name] = {
                "name": bot_name,
                "config": config,
                "status": "running",
                "start_time": datetime.now().isoformat()
            }
            self.performance_metrics[bot_name] = PerformanceMetrics()
            self.trade_history[bot_name] = []

            # Запускаем мониторинг в фоновом режиме
            asyncio.create_task(self._monitor_bot(bot_name))
            return True
        except Exception as e:
            print(f"Ошибка запуска мониторинга: {e}")
            return False

    async def stop_monitoring(self, bot_name: str) -> bool:
        """Остановка мониторинга бота"""
        if bot_name not in self.active_bots:
            return False

        self.active_bots[bot_name]["status"] = "stopped"
        self.active_bots[bot_name]["end_time"] = datetime.now().isoformat()
        return True

    async def _monitor_bot(self, bot_name: str):
        """Мониторинг бота в фоновом режиме"""
        while self.active_bots[bot_name]["status"] == "running":
            try:
                # TODO: Реализовать получение данных о сделках от бота
                # Временная заглушка для демонстрации
                await asyncio.sleep(1)
                
                # Имитация получения данных о сделке
                trade_data = {
                    "timestamp": datetime.now().isoformat(),
                    "symbol": "BTC/USDT",
                    "side": "buy" if np.random.random() > 0.5 else "sell",
                    "price": np.random.uniform(20000, 30000),
                    "size": np.random.uniform(0.1, 1.0),
                    "pnl": np.random.normal(0, 100)
                }

                # Обновляем метрики
                self.performance_metrics[bot_name].update(trade_data)
                self.trade_history[bot_name].append(trade_data)

            except Exception as e:
                print(f"Ошибка мониторинга бота {bot_name}: {e}")
                await asyncio.sleep(5)  # Пауза перед повторной попыткой

    def get_bot_status(self, bot_name: str) -> Optional[Dict[str, Any]]:
        """Получение статуса бота"""
        if bot_name not in self.active_bots:
            return None

        status = self.active_bots[bot_name].copy()
        status["metrics"] = self.performance_metrics[bot_name].to_dict()
        status["recent_trades"] = self.trade_history[bot_name][-10:]  # Последние 10 сделок
        return status

    def get_all_bots_status(self) -> List[Dict[str, Any]]:
        """Получение статуса всех ботов"""
        return [
            self.get_bot_status(name)
            for name in self.active_bots
        ]

    def get_trade_history(self, bot_name: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Получение истории сделок бота"""
        if bot_name not in self.trade_history:
            return []
        return self.trade_history[bot_name][-limit:] 