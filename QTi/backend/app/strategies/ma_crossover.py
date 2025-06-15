from typing import Dict, Any, List
import numpy as np
from .base import Strategy

class MACrossoverStrategy(Strategy):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.fast_period = config.get("fast_period", 9)
        self.slow_period = config.get("slow_period", 21)
        self.signal_period = config.get("signal_period", 9)
        self.risk_per_trade = config.get("risk_per_trade", 0.02)  # 2% risk per trade

    def calculate_ema(self, prices: List[float], period: int) -> List[float]:
        """Calculate Exponential Moving Average."""
        prices = np.array(prices)
        ema = np.zeros_like(prices)
        ema[0] = prices[0]
        multiplier = 2 / (period + 1)
        
        for i in range(1, len(prices)):
            ema[i] = (prices[i] - ema[i-1]) * multiplier + ema[i-1]
        
        return ema.tolist()

    async def analyze(self, candles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze market data using EMA crossover strategy."""
        if len(candles) < self.slow_period:
            return {
                "signal": "hold",
                "price": candles[-1]["close"],
                "size": 0,
                "stop_loss": 0,
                "take_profit": 0
            }

        # Extract closing prices
        closes = [candle["close"] for candle in candles]
        
        # Calculate EMAs
        fast_ema = self.calculate_ema(closes, self.fast_period)
        slow_ema = self.calculate_ema(closes, self.slow_period)
        
        # Get current values
        current_fast = fast_ema[-1]
        current_slow = slow_ema[-1]
        previous_fast = fast_ema[-2]
        previous_slow = slow_ema[-2]
        
        # Current price
        current_price = closes[-1]
        
        # Calculate position size
        size = self.calculate_position_size(current_price, self.risk_per_trade)
        
        # Generate signals
        signal = "hold"
        stop_loss = 0
        take_profit = 0
        
        # Check for crossover
        if previous_fast < previous_slow and current_fast > current_slow:
            # Bullish crossover
            signal = "buy"
            stop_loss = current_price * (1 - self.config.get("stop_loss", 0.02))
            take_profit = current_price * (1 + self.config.get("take_profit", 0.04))
        elif previous_fast > previous_slow and current_fast < current_slow:
            # Bearish crossover
            signal = "sell"
            stop_loss = current_price * (1 + self.config.get("stop_loss", 0.02))
            take_profit = current_price * (1 - self.config.get("take_profit", 0.04))
        
        return {
            "signal": signal,
            "price": current_price,
            "size": size,
            "stop_loss": stop_loss,
            "take_profit": take_profit
        }

    def calculate_position_size(self, price: float, risk_per_trade: float) -> float:
        """Calculate position size based on risk management rules."""
        # Get account balance from config
        account_balance = self.config.get("account_balance", 1000.0)
        
        # Calculate risk amount
        risk_amount = account_balance * risk_per_trade
        
        # Calculate position size
        position_size = risk_amount / price
        
        # Apply position size limits
        max_position_size = self.config.get("max_position_size", 1.0)
        min_position_size = self.config.get("min_position_size", 0.01)
        
        position_size = min(position_size, max_position_size)
        position_size = max(position_size, min_position_size)
        
        return position_size 