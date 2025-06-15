from fastapi import APIRouter
from .endpoints import auth, bots, backtest, market, server, optimization

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(bots.router, prefix="/bots", tags=["bots"])
api_router.include_router(backtest.router, prefix="/backtest", tags=["backtest"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(server.router, prefix="/server", tags=["server"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["optimization"]) 