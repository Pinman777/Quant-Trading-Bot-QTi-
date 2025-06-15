from ..core.strategy import Strategy
import pandas as pd
import numpy as np

class MACDStrategy(Strategy):
    def __init__(self, parameters: dict):
        super().__init__(parameters)
        self.fast_period = parameters.get('fast_period', 12)
        self.slow_period = parameters.get('slow_period', 26)
        self.signal_period = parameters.get('signal_period', 9)
        self.required_parameters = ['fast_period', 'slow_period', 'signal_period']
        
    def generate_signal(self, data: pd.DataFrame) -> int:
        """
        Генерирует торговый сигнал на основе MACD.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            int: 1 для покупки, -1 для продажи, 0 для отсутствия сигнала
        """
        # Рассчитываем индикаторы
        df = self.calculate_indicators(data)
        
        # Проверяем наличие достаточного количества данных
        if len(df) < self.slow_period + self.signal_period:
            return 0
            
        # Получаем последние значения
        current_macd = df['macd'].iloc[-1]
        current_signal = df['macd_signal'].iloc[-1]
        current_hist = df['macd_hist'].iloc[-1]
        
        previous_macd = df['macd'].iloc[-2]
        previous_signal = df['macd_signal'].iloc[-2]
        previous_hist = df['macd_hist'].iloc[-2]
        
        # Проверяем пересечение MACD и сигнальной линии
        if previous_macd <= previous_signal and current_macd > current_signal:
            # MACD пересек сигнальную линию снизу вверх - сигнал на покупку
            return 1
        elif previous_macd >= previous_signal and current_macd < current_signal:
            # MACD пересек сигнальную линию сверху вниз - сигнал на продажу
            return -1
            
        # Проверяем пересечение нулевой линии
        if previous_macd <= 0 and current_macd > 0:
            # MACD пересек нулевую линию снизу вверх - сигнал на покупку
            return 1
        elif previous_macd >= 0 and current_macd < 0:
            # MACD пересек нулевую линию сверху вниз - сигнал на продажу
            return -1
            
        # Проверяем дивергенцию
        if self._check_bullish_divergence(df):
            return 1
        elif self._check_bearish_divergence(df):
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
        # Рассчитываем MACD с разными параметрами
        df['macd_short'] = df['close'].ewm(span=self.fast_period, adjust=False).mean() - \
                          df['close'].ewm(span=self.slow_period, adjust=False).mean()
        df['signal_short'] = df['macd_short'].ewm(span=self.signal_period, adjust=False).mean()
        df['hist_short'] = df['macd_short'] - df['signal_short']
        
        df['macd_long'] = df['close'].ewm(span=self.fast_period * 2, adjust=False).mean() - \
                         df['close'].ewm(span=self.slow_period * 2, adjust=False).mean()
        df['signal_long'] = df['macd_long'].ewm(span=self.signal_period * 2, adjust=False).mean()
        df['hist_long'] = df['macd_long'] - df['signal_long']
        
        # Рассчитываем процентное изменение MACD
        df['macd_change'] = df['macd'].pct_change()
        
        # Рассчитываем накопление/распределение MACD
        df['macd_accumulation'] = df['macd_hist'].cumsum()
        
        return df
        
    def _check_bullish_divergence(self, df: pd.DataFrame) -> bool:
        """
        Проверяет наличие бычьей дивергенции.
        
        Args:
            df: DataFrame с индикаторами
            
        Returns:
            bool: True если обнаружена бычья дивергенция
        """
        # Ищем локальные минимумы цены и MACD
        price_lows = df['close'].rolling(window=5, center=True).min()
        macd_lows = df['macd'].rolling(window=5, center=True).min()
        
        # Проверяем последние 20 свечей
        for i in range(-20, -5):
            if price_lows.iloc[i] < price_lows.iloc[i-1] and \
               macd_lows.iloc[i] > macd_lows.iloc[i-1]:
                return True
                
        return False
        
    def _check_bearish_divergence(self, df: pd.DataFrame) -> bool:
        """
        Проверяет наличие медвежьей дивергенции.
        
        Args:
            df: DataFrame с индикаторами
            
        Returns:
            bool: True если обнаружена медвежья дивергенция
        """
        # Ищем локальные максимумы цены и MACD
        price_highs = df['close'].rolling(window=5, center=True).max()
        macd_highs = df['macd'].rolling(window=5, center=True).max()
        
        # Проверяем последние 20 свечей
        for i in range(-20, -5):
            if price_highs.iloc[i] > price_highs.iloc[i-1] and \
               macd_highs.iloc[i] < macd_highs.iloc[i-1]:
                return True
                
        return False
        
    def validate_parameters(self) -> bool:
        """
        Проверяет корректность параметров стратегии.
        
        Returns:
            bool: True если параметры корректны, False в противном случае
        """
        if not super().validate_parameters():
            return False
            
        # Проверяем корректность периодов
        if self.fast_period >= self.slow_period:
            return False
            
        if self.signal_period <= 0:
            return False
            
        return True 