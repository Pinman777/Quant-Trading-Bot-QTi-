from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from ..core.backtest import BacktestManager
from ..core.config_manager import ConfigManager
from ..core.market_data import MarketData
from ..core.backtest import BacktestEngine
from ..core.strategies import StrategyFactory
from ..core.optimizer import ParameterOptimizer, MultiStrategyOptimizer
from io import BytesIO

router = APIRouter()
config_manager = ConfigManager()
backtest_manager = BacktestManager(config_manager)

class BacktestParams(BaseModel):
    name: str
    config_path: str
    start_date: str
    end_date: str
    exchange: str
    symbol: str

class BacktestResult(BaseModel):
    name: str
    start_time: str
    end_time: Optional[str]
    status: str
    progress: float
    results: Dict[str, Any]
    metrics: Dict[str, float]

@router.post("/backtest", response_model=BacktestResult)
async def start_backtest(params: BacktestParams):
    """Запуск бэктеста"""
    try:
        result = await backtest_manager.start_backtest(
            params.name,
            params.config_path,
            params.start_date,
            params.end_date,
            params.exchange,
            params.symbol,
        )
        return result.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backtest/{name}", response_model=BacktestResult)
async def get_backtest(name: str):
    """Получение информации о бэктесте"""
    result = backtest_manager.get_backtest(name)
    if not result:
        raise HTTPException(status_code=404, detail="Бэктест не найден")
    return result.to_dict()

@router.get("/backtest", response_model=List[BacktestResult])
async def list_backtests():
    """Получение списка всех бэктестов"""
    return backtest_manager.list_backtests()

@router.post("/backtest/{name}/stop")
async def stop_backtest(name: str):
    """Остановка бэктеста"""
    if not backtest_manager.stop_backtest(name):
        raise HTTPException(status_code=404, detail="Бэктест не найден или уже остановлен")
    return {"message": "Бэктест остановлен"}

@router.get("/run")
async def run_backtest(
    symbol: str,
    timeframe: str,
    startDate: str,
    endDate: str,
    initialBalance: float,
    strategy: str,
    params: Dict[str, Any],
    market_data: MarketData = Depends()
) -> Dict[str, Any]:
    """
    Запуск бэктеста для указанной стратегии
    """
    try:
        # Парсим даты
        start = datetime.fromisoformat(startDate)
        end = datetime.fromisoformat(endDate)

        # Получаем исторические данные
        historical_data = await market_data.get_historical_data(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start,
            end_date=end
        )

        # Создаем стратегию
        strategy_instance = StrategyFactory.create_strategy(strategy, params)
        signals = strategy_instance.generate_signals(pd.DataFrame(historical_data))

        # Запускаем бэктест
        backtest = BacktestEngine(
            symbol=symbol,
            timeframe=timeframe,
            initial_balance=initialBalance
        )

        results = backtest.run(signals)

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "startDate": startDate,
            "endDate": endDate,
            "initialBalance": initialBalance,
            "strategy": strategy,
            "params": params,
            "results": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error running backtest: {str(e)}"
        )

@router.get("/optimize")
async def optimize_strategy(
    symbol: str,
    timeframe: str,
    startDate: str,
    endDate: str,
    strategy: str,
    param_ranges: Dict[str, List[Any]],
    metric: str = "sharpe_ratio",
    market_data: MarketData = Depends()
) -> Dict[str, Any]:
    """
    Оптимизация параметров стратегии
    """
    try:
        # Парсим даты
        start = datetime.fromisoformat(startDate)
        end = datetime.fromisoformat(endDate)

        # Получаем исторические данные
        historical_data = await market_data.get_historical_data(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start,
            end_date=end
        )

        # Создаем оптимизатор
        optimizer = ParameterOptimizer(
            data=pd.DataFrame(historical_data),
            strategy_name=strategy,
            param_ranges=param_ranges,
            metric=metric
        )

        # Запускаем оптимизацию
        results = optimizer.optimize()
        best_params = optimizer.get_best_params()
        optimization_results = optimizer.get_optimization_results()

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "strategy": strategy,
            "best_params": best_params,
            "results": results,
            "optimization_results": optimization_results.to_dict(orient='records')
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error optimizing strategy: {str(e)}"
        )

@router.get("/compare")
async def compare_strategies(
    symbol: str,
    timeframe: str,
    startDate: str,
    endDate: str,
    strategies: List[str],
    param_ranges: Dict[str, Dict[str, List[Any]]],
    metric: str = "sharpe_ratio",
    market_data: MarketData = Depends()
) -> Dict[str, Any]:
    """
    Сравнение нескольких стратегий
    """
    try:
        # Парсим даты
        start = datetime.fromisoformat(startDate)
        end = datetime.fromisoformat(endDate)

        # Получаем исторические данные
        historical_data = await market_data.get_historical_data(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start,
            end_date=end
        )

        # Создаем оптимизатор
        optimizer = MultiStrategyOptimizer(
            data=pd.DataFrame(historical_data),
            strategies=strategies,
            param_ranges=param_ranges,
            metric=metric
        )

        # Запускаем оптимизацию
        results = optimizer.optimize()
        best_strategy, best_params = optimizer.get_best_strategy()
        comparison_results = optimizer.get_comparison_results()

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "best_strategy": best_strategy,
            "best_params": best_params,
            "results": results,
            "comparison_results": comparison_results.to_dict(orient='records')
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error comparing strategies: {str(e)}"
        )

@router.get("/export")
async def export_results(
    results: Dict[str, Any],
    format: str = "csv"
) -> Dict[str, Any]:
    """
    Экспорт результатов бэктеста
    """
    try:
        if format == "csv":
            # Экспорт в CSV
            equity_curve_df = pd.DataFrame(results["results"]["equity_curve"])
            trades_df = pd.DataFrame(results["results"]["trades"])
            
            equity_curve_csv = equity_curve_df.to_csv(index=False)
            trades_csv = trades_df.to_csv(index=False)
            
            return {
                "equity_curve": equity_curve_csv,
                "trades": trades_csv
            }
        elif format == "excel":
            # Экспорт в Excel
            equity_curve_df = pd.DataFrame(results["results"]["equity_curve"])
            trades_df = pd.DataFrame(results["results"]["trades"])
            
            # Создаем Excel файл в памяти
            output = BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                equity_curve_df.to_excel(writer, sheet_name='Equity Curve', index=False)
                trades_df.to_excel(writer, sheet_name='Trades', index=False)
            
            return {
                "excel_file": output.getvalue()
            }
        else:
            raise ValueError(f"Unsupported format: {format}")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting results: {str(e)}"
        ) 