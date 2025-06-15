from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from ...models.bot import Position, Trade

class Strategy(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.position: Optional[Position] = None
        self.trades: List[Trade] = []

    @abstractmethod
    async def analyze(self, candles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze market data and return trading signals.
        
        Args:
            candles: List of candlestick data
            
        Returns:
            Dict containing:
            - signal: "buy", "sell", or "hold"
            - price: Target price for the signal
            - size: Position size
            - stop_loss: Stop loss price
            - take_profit: Take profit price
        """
        pass

    @abstractmethod
    def calculate_position_size(self, price: float, risk_per_trade: float) -> float:
        """
        Calculate position size based on risk management rules.
        
        Args:
            price: Current price
            risk_per_trade: Risk per trade as a percentage
            
        Returns:
            Position size in base currency
        """
        pass

    def update_position(self, position: Position):
        """Update current position."""
        self.position = position

    def add_trade(self, trade: Trade):
        """Add a new trade to history."""
        self.trades.append(trade)

    def get_trades(self) -> List[Trade]:
        """Get trade history."""
        return self.trades

    def get_position(self) -> Optional[Position]:
        """Get current position."""
        return self.position

    def should_close_position(self, current_price: float) -> bool:
        """
        Check if current position should be closed based on stop loss or take profit.
        
        Args:
            current_price: Current market price
            
        Returns:
            True if position should be closed, False otherwise
        """
        if not self.position or self.position.side == "none":
            return False

        if self.position.side == "long":
            # Check stop loss
            if current_price <= self.position.entry_price * (1 - self.config.get("stop_loss", 0.02)):
                return True
            # Check take profit
            if current_price >= self.position.entry_price * (1 + self.config.get("take_profit", 0.04)):
                return True
        else:  # short
            # Check stop loss
            if current_price >= self.position.entry_price * (1 + self.config.get("stop_loss", 0.02)):
                return True
            # Check take profit
            if current_price <= self.position.entry_price * (1 - self.config.get("take_profit", 0.04)):
                return True

        return False 