from typing import List
from fastapi import APIRouter, HTTPException
from ...schemas.strategy import Strategy, StrategyCreate, StrategyUpdate
from ...services.strategy import StrategyService

router = APIRouter()
strategy_service = StrategyService()

@router.get("/", response_model=List[Strategy])
async def get_strategies():
    """Get all strategies"""
    return strategy_service.get_strategies()

@router.get("/{strategy_id}", response_model=Strategy)
async def get_strategy(strategy_id: str):
    """Get a specific strategy by ID"""
    try:
        return strategy_service.get_strategy(strategy_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Strategy)
async def create_strategy(strategy: StrategyCreate):
    """Create a new strategy"""
    try:
        return strategy_service.create_strategy(strategy)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{strategy_id}", response_model=Strategy)
async def update_strategy(strategy_id: str, strategy: StrategyUpdate):
    """Update a strategy"""
    try:
        return strategy_service.update_strategy(strategy_id, strategy)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    """Delete a strategy"""
    try:
        strategy_service.delete_strategy(strategy_id)
        return {"message": "Strategy deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{strategy_id}/start", response_model=Strategy)
async def start_strategy(strategy_id: str):
    """Start a strategy"""
    try:
        return strategy_service.start_strategy(strategy_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{strategy_id}/stop", response_model=Strategy)
async def stop_strategy(strategy_id: str):
    """Stop a strategy"""
    try:
        return strategy_service.stop_strategy(strategy_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{strategy_id}/refresh", response_model=Strategy)
async def refresh_strategy(strategy_id: str):
    """Refresh strategy data"""
    try:
        return strategy_service.refresh_strategy(strategy_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 