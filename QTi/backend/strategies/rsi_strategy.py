from ..core.strategy import Strategy
import pandas as pd
import numpy as np

class RSIStrategy(Strategy):
    def __init__(self, parameters: dict):
        super().__init__(parameters)
        self.rsi_period = parameters.get('rsi_period', 14)
        self.overbought = parameters.get('overbought', 70)
        self.oversold = parameters.get('oversold', 30)
        self.required_parameters = ['rsi_period', 'overbought', 'oversold']
        
    def generate_signal(self, data: pd.DataFrame) -> int:
        """
        Генерирует торговый сигнал на основе RSI.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            int: 1 для покупки, -1 для продажи, 0 для отсутствия сигнала
        """
        # Рассчитываем индикаторы
        df = self.calculate_indicators(data)
        
        # Проверяем наличие достаточного количества данных
        if len(df) < self.rsi_period:
            return 0
            
        # Получаем последние значения RSI
        current_rsi = df['rsi'].iloc[-1]
        previous_rsi = df['rsi'].iloc[-2]
        
        # Проверяем условия перепроданности/перекупленности
        if previous_rsi < self.oversold and current_rsi > self.oversold:
            # RSI вышел из зоны перепроданности - сигнал на покупку
            return 1
        elif previous_rsi > self.overbought and current_rsi < self.overbought:
            # RSI вышел из зоны перекупленности - сигнал на продажу
            return -1
            
        return 0
        
    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Рассчитывает технические индикаторы для стратегии.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            pd.DataFrame: DataFrame с добавленными индикаторами
        """
        df = super().calculate_indicators(data)
        
        # Добавляем специфичные для стратегии индикаторы
        # Рассчитываем RSI с разными периодами
        df['rsi_short'] = df['close'].diff().rolling(window=self.rsi_period).apply(
            lambda x: 100 - (100 / (1 + (x[x > 0].sum() / -x[x < 0].sum())))
        )
        
        df['rsi_long'] = df['close'].diff().rolling(window=self.rsi_period * 2).apply(
            lambda x: 100 - (100 / (1 + (x[x > 0].sum() / -x[x < 0].sum())))
        )
        
        # Рассчитываем дивергенцию RSI
        df['price_high'] = df['close'].rolling(window=5).max()
        df['price_low'] = df['close'].rolling(window=5).min()
        df['rsi_high'] = df['rsi'].rolling(window=5).max()
        df['rsi_low'] = df['rsi'].rolling(window=5).min()
        
        # Определяем бычью дивергенцию
        df['bullish_divergence'] = (
            (df['price_low'] < df['price_low'].shift(1)) &
            (df['rsi_low'] > df['rsi_low'].shift(1))
        )
        
        # Определяем медвежью дивергенцию
        df['bearish_divergence'] = (
            (df['price_high'] > df['price_high'].shift(1)) &
            (df['rsi_high'] < df['rsi_high'].shift(1))
        )
        
        return df
        
    def validate_parameters(self) -> bool:
        """
        Проверяет корректность параметров стратегии.
        
        Returns:
            bool: True если параметры корректны, False в противном случае
        """
        if not super().validate_parameters():
            return False
            
        # Проверяем корректность уровней перекупленности/перепроданности
        if self.overbought <= self.oversold:
            return False
            
        if self.overbought > 100 or self.oversold < 0:
            return False
            
        return True 