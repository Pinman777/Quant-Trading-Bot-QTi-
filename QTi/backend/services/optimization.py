import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import numpy as np
from scipy.optimize import differential_evolution
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern

from ..schemas.optimization import (
    OptimizationConfig,
    OptimizationResult,
    OptimizationStatus,
    Trade,
)
from .market import MarketDataService
from .backtest import BacktestService

class OptimizationService:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.results_dir = self.data_dir / 'optimization'
        self.results_dir.mkdir(parents=True, exist_ok=True)
        self.market_service = MarketDataService()
        self.backtest_service = BacktestService(data_dir)
        self.active_optimizations: Dict[str, OptimizationStatus] = {}

    async def get_symbols(self) -> List[str]:
        """Get list of available trading symbols."""
        return await self.market_service.get_symbols()

    async def get_timeframes(self) -> List[str]:
        """Get list of available timeframes."""
        return ['1m', '5m', '15m', '30m', '1h', '4h', '1d']

    async def get_results(self) -> List[OptimizationResult]:
        """Get list of optimization results."""
        results = []
        for file in self.results_dir.glob('*.json'):
            with open(file, 'r') as f:
                data = json.load(f)
                results.append(OptimizationResult(**data))
        return sorted(results, key=lambda x: x.created_at, reverse=True)

    async def get_result(self, result_id: str) -> Optional[OptimizationResult]:
        """Get optimization result by ID."""
        file = self.results_dir / f'{result_id}.json'
        if not file.exists():
            return None
        with open(file, 'r') as f:
            data = json.load(f)
            return OptimizationResult(**data)

    async def start_optimization(self, config: OptimizationConfig) -> str:
        """Start optimization process."""
        optimization_id = str(uuid.uuid4())
        status = OptimizationStatus(
            id=optimization_id,
            status='running',
            progress=0.0,
            currentIteration=0,
            totalIterations=self._calculate_total_iterations(config),
        )
        self.active_optimizations[optimization_id] = status

        # Start optimization in background
        asyncio.create_task(self._run_optimization(optimization_id, config))

        return optimization_id

    async def get_status(self, optimization_id: str) -> Optional[OptimizationStatus]:
        """Get optimization status."""
        return self.active_optimizations.get(optimization_id)

    async def stop_optimization(self, optimization_id: str) -> bool:
        """Stop optimization process."""
        if optimization_id in self.active_optimizations:
            status = self.active_optimizations[optimization_id]
            status.status = 'failed'
            status.error = 'Optimization stopped by user'
            return True
        return False

    async def delete_result(self, result_id: str) -> bool:
        """Delete optimization result."""
        file = self.results_dir / f'{result_id}.json'
        if file.exists():
            file.unlink()
            return True
        return False

    def _calculate_total_iterations(self, config: OptimizationConfig) -> int:
        """Calculate total number of iterations for optimization."""
        if config.optimizationMethod == 'grid':
            steps = config.gridSteps or 5
            param_ranges = [
                len(np.linspace(p[0], p[1], steps))
                for p in [
                    config.parameters.gridSize,
                    config.parameters.gridSpacing,
                    config.parameters.maxPositions,
                    config.parameters.stopLoss,
                    config.parameters.takeProfit,
                ]
            ]
            return np.prod(param_ranges)
        elif config.optimizationMethod == 'genetic':
            return (config.populationSize or 50) * (config.generations or 20)
        else:  # bayesian
            return 100  # Default number of iterations for Bayesian optimization

    async def _run_optimization(
        self, optimization_id: str, config: OptimizationConfig
    ) -> None:
        """Run optimization process."""
        try:
            # Get historical data
            candles = await self.market_service.get_historical_data(
                config.symbol,
                config.timeframe,
                config.startDate,
                config.endDate,
            )

            if config.optimizationMethod == 'grid':
                await self._run_grid_search(optimization_id, config, candles)
            elif config.optimizationMethod == 'genetic':
                await self._run_genetic_optimization(optimization_id, config, candles)
            else:  # bayesian
                await self._run_bayesian_optimization(optimization_id, config, candles)

        except Exception as e:
            status = self.active_optimizations[optimization_id]
            status.status = 'failed'
            status.error = str(e)

    async def _run_grid_search(
        self, optimization_id: str, config: OptimizationConfig, candles: List[Dict[str, Any]]
    ) -> None:
        """Run grid search optimization."""
        status = self.active_optimizations[optimization_id]
        steps = config.gridSteps or 5
        best_result = None
        best_profit = float('-inf')

        # Generate parameter combinations
        param_ranges = {
            'gridSize': np.linspace(
                config.parameters.gridSize[0],
                config.parameters.gridSize[1],
                steps,
            ),
            'gridSpacing': np.linspace(
                config.parameters.gridSpacing[0],
                config.parameters.gridSpacing[1],
                steps,
            ),
            'maxPositions': np.linspace(
                config.parameters.maxPositions[0],
                config.parameters.maxPositions[1],
                steps,
            ),
            'stopLoss': np.linspace(
                config.parameters.stopLoss[0],
                config.parameters.stopLoss[1],
                steps,
            ),
            'takeProfit': np.linspace(
                config.parameters.takeProfit[0],
                config.parameters.takeProfit[1],
                steps,
            ),
        }

        total_combinations = self._calculate_total_iterations(config)
        current_iteration = 0

        # Run backtests for each parameter combination
        for grid_size in param_ranges['gridSize']:
            for grid_spacing in param_ranges['gridSpacing']:
                for max_positions in param_ranges['maxPositions']:
                    for stop_loss in param_ranges['stopLoss']:
                        for take_profit in param_ranges['takeProfit']:
                            parameters = {
                                'gridSize': float(grid_size),
                                'gridSpacing': float(grid_spacing),
                                'maxPositions': int(max_positions),
                                'stopLoss': float(stop_loss),
                                'takeProfit': float(take_profit),
                            }

                            result = await self.backtest_service.run_backtest(
                                config.symbol,
                                config.timeframe,
                                config.startDate,
                                config.endDate,
                                config.initialBalance,
                                parameters,
                            )

                            if result.totalProfit > best_profit:
                                best_profit = result.totalProfit
                                best_result = result

                            current_iteration += 1
                            status.currentIteration = current_iteration
                            status.progress = current_iteration / total_combinations
                            status.bestResult = best_result

        # Save best result
        if best_result:
            result_id = str(uuid.uuid4())
            result_data = best_result.dict()
            result_data['id'] = result_id
            with open(self.results_dir / f'{result_id}.json', 'w') as f:
                json.dump(result_data, f, default=str)

        status.status = 'completed'
        status.progress = 1.0

    async def _run_genetic_optimization(
        self, optimization_id: str, config: OptimizationConfig, candles: List[Dict[str, Any]]
    ) -> None:
        """Run genetic algorithm optimization."""
        status = self.active_optimizations[optimization_id]
        population_size = config.populationSize or 50
        generations = config.generations or 20

        def objective(params):
            parameters = {
                'gridSize': float(params[0]),
                'gridSpacing': float(params[1]),
                'maxPositions': int(params[2]),
                'stopLoss': float(params[3]),
                'takeProfit': float(params[4]),
            }

            result = asyncio.run(
                self.backtest_service.run_backtest(
                    config.symbol,
                    config.timeframe,
                    config.startDate,
                    config.endDate,
                    config.initialBalance,
                    parameters,
                )
            )

            return -result.totalProfit  # Minimize negative profit

        bounds = [
            config.parameters.gridSize,
            config.parameters.gridSpacing,
            config.parameters.maxPositions,
            config.parameters.stopLoss,
            config.parameters.takeProfit,
        ]

        best_result = None
        best_profit = float('-inf')

        for gen in range(generations):
            result = differential_evolution(
                objective,
                bounds,
                popsize=population_size,
                maxiter=1,
                mutation=(0.5, 1.0),
                recombination=0.7,
                seed=gen,
            )

            parameters = {
                'gridSize': float(result.x[0]),
                'gridSpacing': float(result.x[1]),
                'maxPositions': int(result.x[2]),
                'stopLoss': float(result.x[3]),
                'takeProfit': float(result.x[4]),
            }

            backtest_result = await self.backtest_service.run_backtest(
                config.symbol,
                config.timeframe,
                config.startDate,
                config.endDate,
                config.initialBalance,
                parameters,
            )

            if backtest_result.totalProfit > best_profit:
                best_profit = backtest_result.totalProfit
                best_result = backtest_result

            status.currentIteration = gen + 1
            status.progress = (gen + 1) / generations
            status.bestResult = best_result

        # Save best result
        if best_result:
            result_id = str(uuid.uuid4())
            result_data = best_result.dict()
            result_data['id'] = result_id
            with open(self.results_dir / f'{result_id}.json', 'w') as f:
                json.dump(result_data, f, default=str)

        status.status = 'completed'
        status.progress = 1.0

    async def _run_bayesian_optimization(
        self, optimization_id: str, config: OptimizationConfig, candles: List[Dict[str, Any]]
    ) -> None:
        """Run Bayesian optimization."""
        status = self.active_optimizations[optimization_id]
        n_iterations = 100
        best_result = None
        best_profit = float('-inf')

        # Initialize Gaussian Process
        kernel = Matern(nu=2.5)
        gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True)

        # Initial random points
        n_init = 10
        X = np.random.uniform(
            low=[p[0] for p in [
                config.parameters.gridSize,
                config.parameters.gridSpacing,
                config.parameters.maxPositions,
                config.parameters.stopLoss,
                config.parameters.takeProfit,
            ]],
            high=[p[1] for p in [
                config.parameters.gridSize,
                config.parameters.gridSpacing,
                config.parameters.maxPositions,
                config.parameters.stopLoss,
                config.parameters.takeProfit,
            ]],
            size=(n_init, 5),
        )

        y = []
        for params in X:
            parameters = {
                'gridSize': float(params[0]),
                'gridSpacing': float(params[1]),
                'maxPositions': int(params[2]),
                'stopLoss': float(params[3]),
                'takeProfit': float(params[4]),
            }

            result = await self.backtest_service.run_backtest(
                config.symbol,
                config.timeframe,
                config.startDate,
                config.endDate,
                config.initialBalance,
                parameters,
            )

            y.append(-result.totalProfit)  # Minimize negative profit

            if result.totalProfit > best_profit:
                best_profit = result.totalProfit
                best_result = result

        y = np.array(y)

        # Bayesian optimization loop
        for i in range(n_iterations):
            # Update GP
            gp.fit(X, y)

            # Generate random points
            X_candidates = np.random.uniform(
                low=[p[0] for p in [
                    config.parameters.gridSize,
                    config.parameters.gridSpacing,
                    config.parameters.maxPositions,
                    config.parameters.stopLoss,
                    config.parameters.takeProfit,
                ]],
                high=[p[1] for p in [
                    config.parameters.gridSize,
                    config.parameters.gridSpacing,
                    config.parameters.maxPositions,
                    config.parameters.stopLoss,
                    config.parameters.takeProfit,
                ]],
                size=(100, 5),
            )

            # Predict mean and std
            y_pred, y_std = gp.predict(X_candidates, return_std=True)

            # Calculate acquisition function (Upper Confidence Bound)
            kappa = 2.0
            acq = y_pred - kappa * y_std

            # Select best point
            best_idx = np.argmin(acq)
            x_next = X_candidates[best_idx]

            # Evaluate new point
            parameters = {
                'gridSize': float(x_next[0]),
                'gridSpacing': float(x_next[1]),
                'maxPositions': int(x_next[2]),
                'stopLoss': float(x_next[3]),
                'takeProfit': float(x_next[4]),
            }

            result = await self.backtest_service.run_backtest(
                config.symbol,
                config.timeframe,
                config.startDate,
                config.endDate,
                config.initialBalance,
                parameters,
            )

            # Update data
            X = np.vstack((X, x_next))
            y = np.append(y, -result.totalProfit)

            if result.totalProfit > best_profit:
                best_profit = result.totalProfit
                best_result = result

            status.currentIteration = i + 1
            status.progress = (i + 1) / n_iterations
            status.bestResult = best_result

        # Save best result
        if best_result:
            result_id = str(uuid.uuid4())
            result_data = best_result.dict()
            result_data['id'] = result_id
            with open(self.results_dir / f'{result_id}.json', 'w') as f:
                json.dump(result_data, f, default=str)

        status.status = 'completed'
        status.progress = 1.0 