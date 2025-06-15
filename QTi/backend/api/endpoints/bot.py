from typing import List
from fastapi import APIRouter, HTTPException
from ...schemas.bot import Bot, BotCreate, BotUpdate
from ...services.bot import BotService

router = APIRouter()
bot_service = BotService()

@router.get("/", response_model=List[Bot])
async def get_bots():
    """Get all bots"""
    return bot_service.get_bots()

@router.get("/{bot_id}", response_model=Bot)
async def get_bot(bot_id: str):
    """Get a specific bot by ID"""
    try:
        return bot_service.get_bot(bot_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Bot)
async def create_bot(bot: BotCreate):
    """Create a new bot"""
    try:
        return bot_service.create_bot(bot)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{bot_id}", response_model=Bot)
async def update_bot(bot_id: str, bot: BotUpdate):
    """Update a bot"""
    try:
        return bot_service.update_bot(bot_id, bot)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bot_id}")
async def delete_bot(bot_id: str):
    """Delete a bot"""
    try:
        bot_service.delete_bot(bot_id)
        return {"message": "Bot deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bot_id}/start", response_model=Bot)
async def start_bot(bot_id: str):
    """Start a bot"""
    try:
        return bot_service.start_bot(bot_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bot_id}/stop", response_model=Bot)
async def stop_bot(bot_id: str):
    """Stop a bot"""
    try:
        return bot_service.stop_bot(bot_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bot_id}/refresh", response_model=Bot)
async def refresh_bot(bot_id: str):
    """Refresh bot data"""
    try:
        return bot_service.refresh_bot(bot_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 