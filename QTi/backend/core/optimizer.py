import asyncio
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from pathlib import Path
import numpy as np
from itertools import product
from ..core.config_manager import ConfigManager
from ..core.backtest import BacktestManager
import pandas as pd
import logging
import random
from ..core.strategy import Strategy
import importlib
import inspect
from concurrent.futures import ProcessPoolExecutor
from .strategies import StrategyFactory, StrategyParams
from .backtest import BacktestEngine

logger = logging.getLogger(__name__)

class OptimizationResult:
    def __init__(
        self,
        best_params: Dict[str, Any],
        history: List[Dict[str, Any]],
        stats: Dict[str, Any]
    ):
        self.best_params = best_params
        self.history = history
        self.stats = stats

class Optimizer:
    def __init__(
        self,
        config_path: str,
        param_ranges: Dict[str, List[Any]],
        start_date: datetime,
        end_date: datetime,
        exchange: str,
        symbol: str,
        optimization_type: str,
        population_size: int = 50,
        generations: int = 20,
        mutation_rate: float = 0.1,
        crossover_rate: float = 0.8,
        elite_size: int = 5
    ):
        self.config_path = config_path
        self.param_ranges = param_ranges
        self.start_date = start_date
        self.end_date = end_date
        self.exchange = exchange
        self.symbol = symbol
        self.optimization_type = optimization_type
        
        # Параметры генетического алгоритма
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elite_size = elite_size
        
        # Загружаем конфигурацию
        with open(config_path) as f:
            self.config = json.load(f)
            
        # Инициализируем менеджер бэктестинга
        self.backtest_manager = BacktestManager(config_path)
        
        # Загружаем стратегию
        strategy_module = importlib.import_module(
            f"..strategies.{self.config['strategy']}",
            package="QTi.backend"
        )
        strategy_class = next(
            (obj for name, obj in inspect.getmembers(strategy_module)
             if inspect.isclass(obj) and issubclass(obj, Strategy) and obj != Strategy),
            None
        )
        if not strategy_class:
            raise ValueError(f"Strategy class not found in {self.config['strategy']}")
            
        self.strategy_class = strategy_class
        
    def _create_individual(self) -> Dict[str, Any]:
        """
        Создает случайную особь (набор параметров)
        """
        individual = {}
        for param, range_values in self.param_ranges.items():
            if isinstance(range_values[0], (int, float)):
                # Для числовых параметров
                if len(range_values) == 2:
                    # Диапазон значений
                    individual[param] = random.uniform(range_values[0], range_values[1])
                else:
                    # Список возможных значений
                    individual[param] = random.choice(range_values)
            else:
                # Для нечисловых параметров
                individual[param] = random.choice(range_values)
        return individual
        
    def _create_population(self) -> List[Dict[str, Any]]:
        """
        Создает начальную популяцию
        """
        return [self._create_individual() for _ in range(self.population_size)]
        
    async def _evaluate_individual(self, individual: Dict[str, Any]) -> float:
        """
        Оценивает особь с помощью бэктеста
        """
        try:
            # Создаем стратегию с параметрами особи
            strategy = self.strategy_class(individual)
            
            # Запускаем бэктест
            results = await self.backtest_manager.run_backtest(
                strategy=strategy,
                start_date=self.start_date,
                end_date=self.end_date,
                exchange=self.exchange,
                symbol=self.symbol
            )
            
            # Рассчитываем целевую функцию
            if self.optimization_type == "sharpe":
                return results["sharpe_ratio"]
            elif self.optimization_type == "sortino":
                return results["sortino_ratio"]
            elif self.optimization_type == "profit":
                return results["total_profit"]
            elif self.optimization_type == "win_rate":
                return results["win_rate"]
            else:
                raise ValueError(f"Unknown optimization type: {self.optimization_type}")
                
        except Exception as e:
            logger.error(f"Error evaluating individual: {str(e)}")
            return float("-inf")
            
    def _select_parents(self, population: List[Dict[str, Any]], fitness: List[float]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Выбирает родителей для скрещивания с помощью турнирного отбора
        """
        tournament_size = 3
        
        def tournament_select():
            tournament = random.sample(list(zip(population, fitness)), tournament_size)
            return max(tournament, key=lambda x: x[1])[0]
            
        return tournament_select(), tournament_select()
        
    def _crossover(self, parent1: Dict[str, Any], parent2: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Выполняет скрещивание двух родителей
        """
        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()
            
        child1, child2 = {}, {}
        
        for param in self.param_ranges.keys():
            if random.random() < 0.5:
                child1[param] = parent1[param]
                child2[param] = parent2[param]
            else:
                child1[param] = parent2[param]
                child2[param] = parent1[param]
                
        return child1, child2
        
    def _mutate(self, individual: Dict[str, Any]) -> Dict[str, Any]:
        """
        Выполняет мутацию особи
        """
        mutated = individual.copy()
        
        for param, range_values in self.param_ranges.items():
            if random.random() < self.mutation_rate:
                if isinstance(range_values[0], (int, float)):
                    # Для числовых параметров
                    if len(range_values) == 2:
                        # Диапазон значений
                        mutated[param] = random.uniform(range_values[0], range_values[1])
                    else:
                        # Список возможных значений
                        mutated[param] = random.choice(range_values)
                else:
                    # Для нечисловых параметров
                    mutated[param] = random.choice(range_values)
                    
        return mutated
        
    async def optimize(self) -> OptimizationResult:
        """
        Запускает оптимизацию с помощью генетического алгоритма
        """
        # Создаем начальную популяцию
        population = self._create_population()
        best_individual = None
        best_fitness = float("-inf")
        history = []
        
        # Основной цикл эволюции
        for generation in range(self.generations):
            # Оцениваем всех особей
            fitness = await asyncio.gather(
                *[self._evaluate_individual(ind) for ind in population]
            )
            
            # Обновляем лучшую особь
            generation_best_idx = np.argmax(fitness)
            if fitness[generation_best_idx] > best_fitness:
                best_fitness = fitness[generation_best_idx]
                best_individual = population[generation_best_idx]
                
            # Сохраняем статистику поколения
            history.append({
                "generation": generation,
                "best_fitness": best_fitness,
                "avg_fitness": np.mean(fitness),
                "std_fitness": np.std(fitness),
                "best_individual": best_individual
            })
            
            # Создаем новое поколение
            new_population = []
            
            # Элитизм: сохраняем лучших особей
            elite_indices = np.argsort(fitness)[-self.elite_size:]
            new_population.extend([population[i] for i in elite_indices])
            
            # Создаем остальных особей
            while len(new_population) < self.population_size:
                # Выбираем родителей
                parent1, parent2 = self._select_parents(population, fitness)
                
                # Скрещиваем родителей
                child1, child2 = self._crossover(parent1, parent2)
                
                # Мутируем потомков
                child1 = self._mutate(child1)
                child2 = self._mutate(child2)
                
                new_population.extend([child1, child2])
                
            # Обновляем популяцию
            population = new_population[:self.population_size]
            
        # Рассчитываем финальную статистику
        stats = {
            "best_fitness": best_fitness,
            "generations": self.generations,
            "population_size": self.population_size,
            "mutation_rate": self.mutation_rate,
            "crossover_rate": self.crossover_rate,
            "elite_size": self.elite_size
        }
        
        return OptimizationResult(
            best_params=best_individual,
            history=history,
            stats=stats
        )

class ParameterOptimizer:
    """Класс для оптимизации параметров торговых стратегий"""
    
    def __init__(
        self,
        data: pd.DataFrame,
        strategy_name: str,
        param_ranges: Dict[str, List[Any]],
        metric: str = 'sharpe_ratio',
        n_jobs: int = -1
    ):
        self.data = data
        self.strategy_name = strategy_name
        self.param_ranges = param_ranges
        self.metric = metric
        self.n_jobs = n_jobs
        self.results: List[Dict[str, Any]] = []

    def _evaluate_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Оценка параметров стратегии"""
        strategy = StrategyFactory.create_strategy(self.strategy_name, params)
        signals = strategy.generate_signals(self.data.copy())
        
        backtest = BacktestEngine(
            symbol=self.data['symbol'].iloc[0],
            timeframe=self.data['timeframe'].iloc[0],
            initial_balance=10000.0
        )
        
        results = backtest.run(signals)
        return {
            'params': params,
            'results': results
        }

    def optimize(self) -> List[Dict[str, Any]]:
        """Оптимизация параметров"""
        param_combinations = self._generate_param_combinations()
        
        with ProcessPoolExecutor(max_workers=self.n_jobs) as executor:
            results = list(executor.map(self._evaluate_params, param_combinations))
        
        # Сортировка результатов по выбранной метрике
        self.results = sorted(
            results,
            key=lambda x: x['results'][self.metric],
            reverse=True
        )
        
        return self.results

    def _generate_param_combinations(self) -> List[Dict[str, Any]]:
        """Генерация комбинаций параметров"""
        param_names = list(self.param_ranges.keys())
        param_values = list(self.param_ranges.values())
        
        combinations = []
        for values in np.array(np.meshgrid(*param_values)).T.reshape(-1, len(param_names)):
            combinations.append(dict(zip(param_names, values)))
        
        return combinations

    def get_best_params(self) -> Dict[str, Any]:
        """Получение лучших параметров"""
        if not self.results:
            raise ValueError("No optimization results available")
        return self.results[0]['params']

    def get_optimization_results(self) -> pd.DataFrame:
        """Получение результатов оптимизации в виде DataFrame"""
        if not self.results:
            raise ValueError("No optimization results available")
        
        data = []
        for result in self.results:
            row = result['params'].copy()
            row.update({
                'sharpe_ratio': result['results']['sharpe_ratio'],
                'total_return': result['results']['total_return'],
                'max_drawdown': result['results']['max_drawdown'],
                'win_rate': result['results']['win_rate'],
                'profit_factor': result['results']['profit_factor']
            })
            data.append(row)
        
        return pd.DataFrame(data)

class MultiStrategyOptimizer:
    """Класс для оптимизации нескольких стратегий"""
    
    def __init__(
        self,
        data: pd.DataFrame,
        strategies: List[str],
        param_ranges: Dict[str, Dict[str, List[Any]]],
        metric: str = 'sharpe_ratio',
        n_jobs: int = -1
    ):
        self.data = data
        self.strategies = strategies
        self.param_ranges = param_ranges
        self.metric = metric
        self.n_jobs = n_jobs
        self.results: Dict[str, List[Dict[str, Any]]] = {}

    def optimize(self) -> Dict[str, List[Dict[str, Any]]]:
        """Оптимизация всех стратегий"""
        for strategy_name in self.strategies:
            optimizer = ParameterOptimizer(
                data=self.data,
                strategy_name=strategy_name,
                param_ranges=self.param_ranges[strategy_name],
                metric=self.metric,
                n_jobs=self.n_jobs
            )
            self.results[strategy_name] = optimizer.optimize()
        
        return self.results

    def get_best_strategy(self) -> Tuple[str, Dict[str, Any]]:
        """Получение лучшей стратегии и её параметров"""
        if not self.results:
            raise ValueError("No optimization results available")
        
        best_strategy = None
        best_metric = float('-inf')
        best_params = None
        
        for strategy_name, results in self.results.items():
            if results and results[0]['results'][self.metric] > best_metric:
                best_metric = results[0]['results'][self.metric]
                best_strategy = strategy_name
                best_params = results[0]['params']
        
        return best_strategy, best_params

    def get_comparison_results(self) -> pd.DataFrame:
        """Получение сравнительных результатов всех стратегий"""
        if not self.results:
            raise ValueError("No optimization results available")
        
        data = []
        for strategy_name, results in self.results.items():
            if results:
                best_result = results[0]
                row = {
                    'strategy': strategy_name,
                    'sharpe_ratio': best_result['results']['sharpe_ratio'],
                    'total_return': best_result['results']['total_return'],
                    'max_drawdown': best_result['results']['max_drawdown'],
                    'win_rate': best_result['results']['win_rate'],
                    'profit_factor': best_result['results']['profit_factor']
                }
                row.update(best_result['params'])
                data.append(row)
        
        return pd.DataFrame(data) 