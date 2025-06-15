from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
from datetime import datetime
import asyncio
import json
from ..models.bot import Bot, BotStatus, Trade
from ..services.bot_manager import BotManager
from ..services.market_data import MarketDataService

router = APIRouter()
bot_manager = BotManager()
market_data = MarketDataService()

# WebSocket connections
active_connections: List[WebSocket] = []

async def broadcast_update(message: Dict[str, Any]):
    """Broadcast message to all connected WebSocket clients."""
    for connection in active_connections:
        try:
            await connection.send_json(message)
        except WebSocketDisconnect:
            active_connections.remove(connection)

@router.get("/bots", response_model=List[BotStatus])
async def get_bots():
    """Get status of all bots."""
    return bot_manager.get_all_bots_status()

@router.get("/bots/{bot_id}", response_model=BotStatus)
async def get_bot(bot_id: str):
    """Get status of a specific bot."""
    bot = bot_manager.get_bot_status(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return bot

@router.post("/bots/{bot_id}/start")
async def start_bot(bot_id: str):
    """Start a bot."""
    try:
        bot_manager.start_bot(bot_id)
        return {"message": "Bot started successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bots/{bot_id}/stop")
async def stop_bot(bot_id: str):
    """Stop a bot."""
    try:
        bot_manager.stop_bot(bot_id)
        return {"message": "Bot stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bots/{bot_id}/chart")
async def get_bot_chart_data(bot_id: str):
    """Get chart data for a bot."""
    try:
        bot = bot_manager.get_bot(bot_id)
        if not bot:
            raise HTTPException(status_code=404, detail="Bot not found")
        
        # Get candlestick data
        candles = await market_data.get_candles(
            symbol=bot.symbol,
            timeframe=bot.timeframe,
            limit=1000
        )
        
        # Get volume data
        volume = await market_data.get_volume(
            symbol=bot.symbol,
            timeframe=bot.timeframe,
            limit=1000
        )
        
        return {
            "candles": candles,
            "volume": volume
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/trades", response_model=List[Trade])
async def get_trades():
    """Get recent trades."""
    return bot_manager.get_recent_trades()

@router.get("/bots/{bot_id}/trades", response_model=List[Trade])
async def get_bot_trades(bot_id: str):
    """Get trades for a specific bot."""
    return bot_manager.get_bot_trades(bot_id)

@router.websocket("/ws/bots")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time bot updates."""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Send initial bot statuses
            bots = bot_manager.get_all_bots_status()
            await websocket.send_json({
                "type": "initial_status",
                "bots": bots
            })
            
            # Wait for updates
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket) 