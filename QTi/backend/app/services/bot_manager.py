from typing import List, Dict, Any, Optional, Type
from datetime import datetime
import uuid
import asyncio
from ..models.bot import Bot, BotStatus, Trade, BotConfig, Position
from ..services.market_data import MarketDataService
from ..strategies.base import Strategy
from ..strategies.ma_crossover import MACrossoverStrategy
from ..strategies.rsi import RSIStrategy
from ..exchanges.factory import ExchangeFactory
from ..notifications.manager import NotificationManager
from ..notifications.base import NotificationType, NotificationPriority

class BotManager:
    def __init__(self):
        self.bots: Dict[str, Bot] = {}
        self.trades: List[Trade] = []
        self.market_data = MarketDataService()
        self._running_tasks: Dict[str, asyncio.Task] = {}
        self._exchanges: Dict[str, Any] = {}
        self._running = False
        self._notification_manager = NotificationManager()
        
        # Strategy mapping
        self.strategy_map: Dict[str, Type[Strategy]] = {
            "ma_crossover": MACrossoverStrategy,
            "rsi": RSIStrategy
        }

    async def start(self):
        """Start bot manager."""
        if not self._running:
            self._running = True
            await self._notification_manager.start()
            asyncio.create_task(self._monitor_bots())

    async def stop(self):
        """Stop bot manager."""
        self._running = False
        await self._notification_manager.stop()

    def create_bot(self, config: BotConfig) -> Bot:
        """Create a new bot instance."""
        bot_id = str(uuid.uuid4())
        bot = Bot(
            id=bot_id,
            config=config,
            status=BotStatus(
                id=bot_id,
                name=config.name,
                symbol=config.symbol,
                status="stopped",
                pnl=0.0,
                position=Position(
                    side="none",
                    size=0.0,
                    entry_price=0.0,
                    current_price=0.0
                ),
                last_update=datetime.utcnow()
            )
        )
        self.bots[bot_id] = bot

        await self._notification_manager.create_notification(
            title="Bot Created",
            message=f"Bot {config.name} has been created",
            type=NotificationType.INFO,
            data={"bot_id": bot_id, "bot_name": config.name}
        )

        return bot

    def get_bot(self, bot_id: str) -> Optional[Bot]:
        """Get a bot by ID."""
        return self.bots.get(bot_id)

    def get_all_bots_status(self) -> List[BotStatus]:
        """Get status of all bots."""
        return [bot.status for bot in self.bots.values()]

    def get_bot_status(self, bot_id: str) -> Optional[BotStatus]:
        """Get status of a specific bot."""
        bot = self.get_bot(bot_id)
        return bot.status if bot else None

    async def start_bot(self, bot_id: str):
        """Start a bot."""
        bot = self.get_bot(bot_id)
        if not bot:
            raise ValueError("Bot not found")
        
        if bot.status.status == "running":
            return
        
        # Create exchange instance if not exists
        if bot.config.exchange not in self._exchanges:
            self._exchanges[bot.config.exchange] = ExchangeFactory.create(
                bot.config.exchange,
                bot.config.exchange_config
            )
        
        # Update bot status
        bot.status.status = "running"
        bot.status.last_update = datetime.utcnow()
        
        # Start bot task
        task = asyncio.create_task(self._run_bot(bot))
        self._running_tasks[bot_id] = task

        await self._notification_manager.create_notification(
            title="Bot Started",
            message=f"Bot {bot.config.name} has been started",
            type=NotificationType.SUCCESS,
            data={"bot_id": bot.id, "bot_name": bot.config.name}
        )

    async def stop_bot(self, bot_id: str):
        """Stop a bot."""
        bot = self.get_bot(bot_id)
        if not bot:
            raise ValueError("Bot not found")
        
        if bot.status.status != "running":
            return
        
        # Cancel running task
        if bot_id in self._running_tasks:
            self._running_tasks[bot_id].cancel()
            del self._running_tasks[bot_id]
        
        # Update bot status
        bot.status.status = "stopped"
        bot.status.last_update = datetime.utcnow()

        await self._notification_manager.create_notification(
            title="Bot Stopped",
            message=f"Bot {bot.config.name} has been stopped",
            type=NotificationType.INFO,
            data={"bot_id": bot.id, "bot_name": bot.config.name}
        )

    def get_recent_trades(self, limit: int = 100) -> List[Trade]:
        """Get recent trades."""
        return sorted(
            self.trades,
            key=lambda x: x.timestamp,
            reverse=True
        )[:limit]

    def get_bot_trades(self, bot_id: str, limit: int = 100) -> List[Trade]:
        """Get trades for a specific bot."""
        return sorted(
            [t for t in self.trades if t.bot_id == bot_id],
            key=lambda x: x.timestamp,
            reverse=True
        )[:limit]

    def _create_strategy(self, bot: Bot) -> Strategy:
        """Create strategy instance based on bot configuration."""
        strategy_class = self.strategy_map.get(bot.config.strategy)
        if not strategy_class:
            raise ValueError(f"Unknown strategy: {bot.config.strategy}")
        
        return strategy_class(bot.config.parameters)

    async def _run_bot(self, bot: Bot):
        """Run bot trading logic."""
        try:
            # Create strategy instance
            strategy = self._create_strategy(bot)
            
            # Get exchange instance
            exchange = self._exchanges[bot.config.exchange]
            
            while True:
                # Get market data
                candles = await exchange.get_candles(
                    symbol=bot.config.symbol,
                    timeframe=bot.config.timeframe,
                    limit=100
                )
                
                if not candles:
                    await asyncio.sleep(1)
                    continue
                
                # Get current price
                current_price = candles[-1]["close"]
                
                # Update current price in position
                if bot.status.position.side != "none":
                    bot.status.position.current_price = current_price
                    
                    # Calculate P&L
                    price_diff = (
                        current_price - bot.status.position.entry_price
                        if bot.status.position.side == "long"
                        else bot.status.position.entry_price - current_price
                    )
                    bot.status.pnl = (
                        price_diff / bot.status.position.entry_price * 100
                    )
                
                # Check if position should be closed
                if strategy.should_close_position(current_price):
                    # Close position
                    order = await exchange.create_order(
                        symbol=bot.config.symbol,
                        side="sell" if bot.status.position.side == "long" else "buy",
                        order_type="market",
                        quantity=bot.status.position.size
                    )
                    
                    trade = Trade(
                        id=str(uuid.uuid4()),
                        bot_id=bot.id,
                        symbol=bot.config.symbol,
                        side="sell" if bot.status.position.side == "long" else "buy",
                        price=current_price,
                        size=bot.status.position.size,
                        timestamp=datetime.utcnow(),
                        pnl=bot.status.pnl
                    )
                    self.trades.append(trade)
                    strategy.add_trade(trade)
                    
                    # Reset position
                    bot.status.position = Position(
                        side="none",
                        size=0.0,
                        entry_price=0.0,
                        current_price=current_price
                    )
                else:
                    # Analyze market data
                    analysis = await strategy.analyze(candles)
                    
                    # Execute trades based on signals
                    if analysis["signal"] != "hold" and bot.status.position.side == "none":
                        # Open new position
                        order = await exchange.create_order(
                            symbol=bot.config.symbol,
                            side=analysis["signal"],
                            order_type="market",
                            quantity=analysis["size"]
                        )
                        
                        trade = Trade(
                            id=str(uuid.uuid4()),
                            bot_id=bot.id,
                            symbol=bot.config.symbol,
                            side=analysis["signal"],
                            price=current_price,
                            size=analysis["size"],
                            timestamp=datetime.utcnow(),
                            pnl=0.0
                        )
                        self.trades.append(trade)
                        strategy.add_trade(trade)
                        
                        # Update position
                        bot.status.position = Position(
                            side="long" if analysis["signal"] == "buy" else "short",
                            size=analysis["size"],
                            entry_price=current_price,
                            current_price=current_price
                        )
                
                # Update last update time
                bot.status.last_update = datetime.utcnow()
                
                # Wait for next iteration
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            # Bot was stopped
            pass
        except Exception as e:
            # Handle errors
            bot.status.status = "error"
            bot.status.last_update = datetime.utcnow()
            print(f"Bot {bot.id} error: {e}")

    def add_trade(self, trade: Trade):
        """Add a new trade to the history."""
        self.trades.append(trade)
        # Keep only last 1000 trades
        if len(self.trades) > 1000:
            self.trades = self.trades[-1000:]

    async def _monitor_bots(self):
        """Monitor running bots."""
        while self._running:
            try:
                for name, bot in self.bots.items():
                    if bot.status.status == "running":
                        # Check bot health
                        try:
                            exchange = self._exchanges[bot.config.exchange]
                            ticker = await exchange.get_ticker(bot.config.symbol)
                            
                            # Update bot status
                            bot.status.last_update = datetime.utcnow()
                            bot.status.last_price = ticker["last"]
                            
                        except Exception as e:
                            await self._notification_manager.create_notification(
                                title="Bot Error",
                                message=f"Error monitoring bot {name}: {str(e)}",
                                type=NotificationType.ERROR,
                                priority=NotificationPriority.HIGH,
                                data={"bot_id": bot.id, "bot_name": name, "error": str(e)}
                            )
                            bot.status.status = "error"
                            bot.status.last_error = str(e)
                            bot.status.last_update = datetime.utcnow()

                await asyncio.sleep(1)  # Check every second
            except Exception as e:
                print(f"Error in bot monitor: {e}")
                await asyncio.sleep(5)  # Wait before retrying 