import os
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from fastapi import HTTPException
from ..schemas.backtest import BacktestConfig, BacktestResult, BacktestHistory, Trade
from ..logger import backtest_logger, log_extra
import asyncio

class BacktestService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), '../data/backtest')
        os.makedirs(self.data_dir, exist_ok=True)
        self.results_file = os.path.join(self.data_dir, 'results.json')
        self._load_results()

    def _load_results(self) -> None:
        if os.path.exists(self.results_file):
            with open(self.results_file, 'r') as f:
                self.results = json.load(f)
        else:
            self.results = {}
            self._save_results()

    def _save_results(self) -> None:
        with open(self.results_file, 'w') as f:
            json.dump(self.results, f, default=str)

    def _get_result_path(self, result_id: str) -> str:
        return os.path.join(self.data_dir, f'{result_id}.json')

    def _calculate_metrics(self, trades: List[Trade], initial_balance: float) -> dict:
        if not trades:
            return {
                'total_profit': 0,
                'win_rate': 0,
                'total_trades': 0,
                'average_profit': 0,
                'max_drawdown': 0,
                'sharpe_ratio': 0,
            }

        profits = [trade.profit for trade in trades]
        winning_trades = len([p for p in profits if p > 0])
        total_trades = len(trades)

        # Calculate equity curve
        equity = initial_balance
        equity_curve = []
        for trade in trades:
            equity *= (1 + trade.profit / 100)
            equity_curve.append({
                'timestamp': trade.timestamp.isoformat(),
                'equity': equity
            })

        # Calculate drawdown
        peak = initial_balance
        max_drawdown = 0
        for point in equity_curve:
            if point['equity'] > peak:
                peak = point['equity']
            drawdown = (peak - point['equity']) / peak * 100
            max_drawdown = max(max_drawdown, drawdown)

        # Calculate Sharpe ratio
        returns = pd.Series([p for p in profits])
        sharpe_ratio = np.sqrt(252) * returns.mean() / returns.std() if len(returns) > 1 else 0

        return {
            'total_profit': sum(profits),
            'win_rate': (winning_trades / total_trades * 100) if total_trades > 0 else 0,
            'total_trades': total_trades,
            'average_profit': sum(profits) / total_trades if total_trades > 0 else 0,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'equity_curve': equity_curve,
        }

    def run_backtest(self, config: BacktestConfig) -> BacktestResult:
        try:
            # TODO: Implement actual backtesting logic here
            # For now, we'll generate some sample data
            trades = []
            current_time = config.start_date
            while current_time < config.end_date:
                if np.random.random() < 0.1:  # 10% chance of trade
                    trade = Trade(
                        timestamp=current_time,
                        type='buy' if np.random.random() < 0.5 else 'sell',
                        price=100 + np.random.normal(0, 5),
                        size=1.0,
                        profit=np.random.normal(0, 2)
                    )
                    trades.append(trade)
                current_time = pd.Timestamp(current_time) + pd.Timedelta(hours=1)

            metrics = self._calculate_metrics(trades, config.initial_balance)

            result = BacktestResult(
                id=str(uuid.uuid4()),
                config=config,
                trades=trades,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                **metrics
            )

            self.results[result.id] = result.dict()
            self._save_results()

            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def get_backtest_results(self) -> List[BacktestResult]:
        return [BacktestResult(**result) for result in self.results.values()]

    def get_backtest_result(self, result_id: str) -> BacktestResult:
        if result_id not in self.results:
            raise HTTPException(status_code=404, detail="Backtest result not found")
        return BacktestResult(**self.results[result_id])

    def delete_backtest_result(self, result_id: str) -> None:
        if result_id not in self.results:
            raise HTTPException(status_code=404, detail="Backtest result not found")
        del self.results[result_id]
        self._save_results()

    def get_backtest_history(self) -> List[BacktestHistory]:
        history = []
        for result in self.results.values():
            history.append(BacktestHistory(
                id=result['id'],
                symbol=result['config']['symbol'],
                timeframe=result['config']['timeframe'],
                start_date=result['config']['start_date'],
                end_date=result['config']['end_date'],
                total_profit=result['total_profit'],
                created_at=result['created_at']
            ))
        return sorted(history, key=lambda x: x.created_at, reverse=True)

class Backtest:
    def __init__(self, config_path: str):
        """Инициализация сервиса бэктестинга
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        
        backtest_logger.info(
            "Сервис бэктестинга инициализирован",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация бэктестинга
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            backtest_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            backtest_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def run_backtest(self, strategy: Dict[str, Any], historical_data: pd.DataFrame,
                    initial_capital: float = 100000.0) -> Dict[str, Any]:
        """Запуск бэктеста
        
        Args:
            strategy: Параметры стратегии
            historical_data: Исторические данные
            initial_capital: Начальный капитал
            
        Returns:
            Dict[str, Any]: Результаты бэктеста
        """
        try:
            backtest_logger.info(
                "Запуск бэктеста",
                extra=log_extra({
                    "strategy": strategy,
                    "data_shape": historical_data.shape,
                    "initial_capital": initial_capital
                })
            )
            
            # TODO: Реализовать бэктест
            
            results = {
                "strategy": strategy,
                "initial_capital": initial_capital,
                "final_capital": initial_capital,
                "returns": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown": 0.0,
                "trades": [],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            backtest_logger.info(
                "Бэктест завершен",
                extra=log_extra({
                    "results": results
                })
            )
            
            return results
            
        except Exception as e:
            backtest_logger.error(
                "Ошибка выполнения бэктеста",
                exc_info=True,
                extra=log_extra({
                    "strategy": strategy,
                    "data_shape": historical_data.shape,
                    "initial_capital": initial_capital,
                    "error": str(e)
                })
            )
            raise
            
    def calculate_metrics(self, returns: pd.Series) -> Dict[str, float]:
        """Расчет метрик
        
        Args:
            returns: Доходности
            
        Returns:
            Dict[str, float]: Метрики
        """
        try:
            # Расчет метрик
            total_return = (1 + returns).prod() - 1
            annual_return = (1 + total_return) ** (252 / len(returns)) - 1
            volatility = returns.std() * np.sqrt(252)
            sharpe_ratio = annual_return / volatility if volatility != 0 else 0
            max_drawdown = (returns.cumsum() - returns.cumsum().cummax()).min()
            
            metrics = {
                "total_return": total_return,
                "annual_return": annual_return,
                "volatility": volatility,
                "sharpe_ratio": sharpe_ratio,
                "max_drawdown": max_drawdown
            }
            
            backtest_logger.info(
                "Метрики рассчитаны",
                extra=log_extra({
                    "metrics": metrics
                })
            )
            
            return metrics
            
        except Exception as e:
            backtest_logger.error(
                "Ошибка расчета метрик",
                exc_info=True,
                extra=log_extra({
                    "returns_shape": returns.shape,
                    "error": str(e)
                })
            )
            raise
            
    def analyze_trades(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Анализ сделок
        
        Args:
            trades: Список сделок
            
        Returns:
            Dict[str, Any]: Результаты анализа
        """
        try:
            if not trades:
                backtest_logger.warning(
                    "Нет сделок для анализа",
                    extra=log_extra({})
                )
                return {}
                
            # Анализ сделок
            total_trades = len(trades)
            winning_trades = len([t for t in trades if t["profit"] > 0])
            losing_trades = len([t for t in trades if t["profit"] <= 0])
            win_rate = winning_trades / total_trades if total_trades > 0 else 0
            
            avg_profit = np.mean([t["profit"] for t in trades if t["profit"] > 0]) if winning_trades > 0 else 0
            avg_loss = np.mean([t["profit"] for t in trades if t["profit"] <= 0]) if losing_trades > 0 else 0
            profit_factor = abs(avg_profit / avg_loss) if avg_loss != 0 else float("inf")
            
            analysis = {
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "losing_trades": losing_trades,
                "win_rate": win_rate,
                "avg_profit": avg_profit,
                "avg_loss": avg_loss,
                "profit_factor": profit_factor
            }
            
            backtest_logger.info(
                "Сделки проанализированы",
                extra=log_extra({
                    "analysis": analysis
                })
            )
            
            return analysis
            
        except Exception as e:
            backtest_logger.error(
                "Ошибка анализа сделок",
                exc_info=True,
                extra=log_extra({
                    "trades_count": len(trades),
                    "error": str(e)
                })
            )
            raise
            
    def generate_report(self, results: Dict[str, Any]) -> str:
        """Генерация отчета
        
        Args:
            results: Результаты бэктеста
            
        Returns:
            str: Отчет
        """
        try:
            # Генерация отчета
            report = f"""
            Backtest Report
            ==============
            
            Strategy: {results["strategy"]}
            Initial Capital: ${results["initial_capital"]:,.2f}
            Final Capital: ${results["final_capital"]:,.2f}
            Total Return: {results["returns"]*100:.2f}%
            Sharpe Ratio: {results["sharpe_ratio"]:.2f}
            Max Drawdown: {results["max_drawdown"]*100:.2f}%
            
            Trades: {len(results["trades"])}
            """
            
            backtest_logger.info(
                "Отчет сгенерирован",
                extra=log_extra({
                    "report": report
                })
            )
            
            return report
            
        except Exception as e:
            backtest_logger.error(
                "Ошибка генерации отчета",
                exc_info=True,
                extra=log_extra({
                    "results": results,
                    "error": str(e)
                })
            )
            raise

backtest_service = BacktestService() 