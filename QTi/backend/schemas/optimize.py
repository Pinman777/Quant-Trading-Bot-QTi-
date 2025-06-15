from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class OptimizationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class OptimizationType(str, Enum):
    SHARPE = "sharpe"
    SORTINO = "sortino"
    PROFIT = "profit"
    WIN_RATE = "win_rate"

class OptimizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название оптимизации")
    param_ranges: Dict[str, List[Any]] = Field(..., description="Диапазоны параметров для оптимизации")
    start_date: datetime = Field(..., description="Дата начала периода оптимизации")
    end_date: datetime = Field(..., description="Дата окончания периода оптимизации")
    exchange: str = Field(..., description="Биржа для оптимизации")
    symbol: str = Field(..., description="Торговая пара")
    optimization_type: OptimizationType = Field(..., description="Тип оптимизации")
    config: Dict[str, Any]

class OptimizationCreate(OptimizationBase):
    pass

class OptimizationUpdate(BaseModel):
    name: Optional[str] = None
    param_ranges: Optional[Dict[str, List[Any]]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    exchange: Optional[str] = None
    symbol: Optional[str] = None
    optimization_type: Optional[OptimizationType] = None

class OptimizationResult(BaseModel):
    params: Dict[str, Any] = Field(..., description="Параметры стратегии")
    metrics: Dict[str, float] = Field(..., description="Метрики производительности")
    timestamp: datetime = Field(default_factory=datetime.now, description="Время создания результата")

class OptimizationHistory(BaseModel):
    generation: int = Field(..., description="Номер поколения")
    best_fitness: float = Field(..., description="Лучшая приспособленность")
    avg_fitness: float = Field(..., description="Средняя приспособленность")
    std_fitness: float = Field(..., description="Стандартное отклонение приспособленности")
    best_individual: Dict[str, Any] = Field(..., description="Лучшая особь")

class OptimizationStats(BaseModel):
    best_fitness: float = Field(..., description="Лучшая приспособленность")
    generations: int = Field(..., description="Количество поколений")
    population_size: int = Field(..., description="Размер популяции")
    mutation_rate: float = Field(..., description="Вероятность мутации")
    crossover_rate: float = Field(..., description="Вероятность скрещивания")
    elite_size: int = Field(..., description="Размер элиты")

class OptimizationResponse(OptimizationBase):
    id: int = Field(..., description="ID оптимизации")
    bot_id: int = Field(..., description="ID бота")
    status: OptimizationStatus = Field(..., description="Статус оптимизации")
    created_at: datetime = Field(..., description="Время создания")
    updated_at: datetime = Field(..., description="Время последнего обновления")
    results: Optional[List[OptimizationResult]] = Field(None, description="Результаты оптимизации")
    history: Optional[List[OptimizationHistory]] = Field(None, description="История оптимизации")
    stats: Optional[OptimizationStats] = Field(None, description="Статистика оптимизации")
    owner_id: int = Field(..., description="ID владельца")

    class Config:
        from_attributes = True

class OptimizationResults(BaseModel):
    iterations: List[Dict[str, Any]]
    best_params: Optional[Dict[str, Any]]
    best_score: float
    progress: float

class OptimizationIteration(BaseModel):
    iteration: int
    params: Dict[str, Any]
    score: float
    metrics: Dict[str, float]
    timestamp: datetime 