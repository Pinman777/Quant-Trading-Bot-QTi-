from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime

from ...schemas.optimization import (
    OptimizationConfig,
    OptimizationResult,
    OptimizationStatus,
)
from ...services.optimization import OptimizationService
from ...core.config import settings

router = APIRouter()
optimization_service = OptimizationService(settings.DATA_DIR)

@router.get('/symbols', response_model=List[str])
async def get_symbols():
    """Get list of available trading symbols."""
    return await optimization_service.get_symbols()

@router.get('/timeframes', response_model=List[str])
async def get_timeframes():
    """Get list of available timeframes."""
    return await optimization_service.get_timeframes()

@router.get('/results', response_model=List[OptimizationResult])
async def get_results():
    """Get list of optimization results."""
    return await optimization_service.get_results()

@router.get('/results/{result_id}', response_model=OptimizationResult)
async def get_result(result_id: str):
    """Get optimization result by ID."""
    result = await optimization_service.get_result(result_id)
    if not result:
        raise HTTPException(status_code=404, detail='Result not found')
    return result

@router.post('/start', response_model=dict)
async def start_optimization(config: OptimizationConfig):
    """Start optimization process."""
    try:
        optimization_id = await optimization_service.start_optimization(config)
        return {'id': optimization_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/status/{optimization_id}', response_model=OptimizationStatus)
async def get_status(optimization_id: str):
    """Get optimization status."""
    status = await optimization_service.get_status(optimization_id)
    if not status:
        raise HTTPException(status_code=404, detail='Optimization not found')
    return status

@router.post('/stop/{optimization_id}', response_model=dict)
async def stop_optimization(optimization_id: str):
    """Stop optimization process."""
    success = await optimization_service.stop_optimization(optimization_id)
    if not success:
        raise HTTPException(status_code=404, detail='Optimization not found')
    return {'status': 'stopped'}

@router.delete('/results/{result_id}', response_model=dict)
async def delete_result(result_id: str):
    """Delete optimization result."""
    success = await optimization_service.delete_result(result_id)
    if not success:
        raise HTTPException(status_code=404, detail='Result not found')
    return {'status': 'deleted'} 