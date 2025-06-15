from ..core.strategy import Strategy
import pandas as pd
import numpy as np

class MovingAverageCrossover(Strategy):
    def __init__(self, parameters: dict):
        super().__init__(parameters)
        self.fast_period = parameters.get('fast_period', 20)
        self.slow_period = parameters.get('slow_period', 50)
        self.signal_period = parameters.get('signal_period', 9)
        self.required_parameters = ['fast_period', 'slow_period']
        
    def generate_signal(self, data: pd.DataFrame) -> int:
        """
        Генерирует торговый сигнал на основе пересечения скользящих средних.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            int: 1 для покупки, -1 для продажи, 0 для отсутствия сигнала
        """
        # Рассчитываем индикаторы
        df = self.calculate_indicators(data)
        
        # Проверяем наличие достаточного количества данных
        if len(df) < self.slow_period:
            return 0
            
        # Получаем последние значения
        current_fast = df['ema_20'].iloc[-1]
        current_slow = df['ema_50'].iloc[-1]
        previous_fast = df['ema_20'].iloc[-2]
        previous_slow = df['ema_50'].iloc[-2]
        
        # Проверяем пересечение
        if previous_fast <= previous_slow and current_fast > current_slow:
            # Быстрая MA пересекла медленную MA снизу вверх - сигнал на покупку
            return 1
        elif previous_fast >= previous_slow and current_fast < current_slow:
            # Быстрая MA пересекла медленную MA сверху вниз - сигнал на продажу
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
        df['fast_ma'] = df['close'].ewm(span=self.fast_period, adjust=False).mean()
        df['slow_ma'] = df['close'].ewm(span=self.slow_period, adjust=False).mean()
        
        # Рассчитываем MACD
        df['macd'] = df['fast_ma'] - df['slow_ma']
        df['signal'] = df['macd'].ewm(span=self.signal_period, adjust=False).mean()
        df['histogram'] = df['macd'] - df['signal']
        
        return df
        
    def validate_parameters(self) -> bool:
        """
        Проверяет корректность параметров стратегии.
        
        Returns:
            bool: True если параметры корректны, False в противном случае
        """
        if not super().validate_parameters():
            return False
            
        # Проверяем, что быстрый период меньше медленного
        if self.fast_period >= self.slow_period:
            return False
            
        return True 