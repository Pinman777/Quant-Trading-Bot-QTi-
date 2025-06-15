from ..core.strategy import Strategy
import pandas as pd
import numpy as np

class BollingerBandsStrategy(Strategy):
    def __init__(self, parameters: dict):
        super().__init__(parameters)
        self.bb_period = parameters.get('bb_period', 20)
        self.bb_std = parameters.get('bb_std', 2.0)
        self.required_parameters = ['bb_period', 'bb_std']
        
    def generate_signal(self, data: pd.DataFrame) -> int:
        """
        Генерирует торговый сигнал на основе полос Боллинджера.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            int: 1 для покупки, -1 для продажи, 0 для отсутствия сигнала
        """
        # Рассчитываем индикаторы
        df = self.calculate_indicators(data)
        
        # Проверяем наличие достаточного количества данных
        if len(df) < self.bb_period:
            return 0
            
        # Получаем последние значения
        current_close = df['close'].iloc[-1]
        current_upper = df['bbands_upper'].iloc[-1]
        current_lower = df['bbands_lower'].iloc[-1]
        current_middle = df['bbands_middle'].iloc[-1]
        
        previous_close = df['close'].iloc[-2]
        previous_upper = df['bbands_upper'].iloc[-2]
        previous_lower = df['bbands_lower'].iloc[-2]
        
        # Проверяем пробой верхней полосы
        if previous_close <= previous_upper and current_close > current_upper:
            # Цена пробила верхнюю полосу - сигнал на продажу
            return -1
            
        # Проверяем пробой нижней полосы
        if previous_close >= previous_lower and current_close < current_lower:
            # Цена пробила нижнюю полосу - сигнал на покупку
            return 1
            
        # Проверяем возврат к средней линии
        if current_close > current_middle and previous_close <= current_middle:
            # Цена вернулась к средней линии снизу - сигнал на покупку
            return 1
        elif current_close < current_middle and previous_close >= current_middle:
            # Цена вернулась к средней линии сверху - сигнал на продажу
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
        # Рассчитываем полосы Боллинджера с разными параметрами
        df['bb_middle_short'] = df['close'].rolling(window=self.bb_period).mean()
        df['bb_std_short'] = df['close'].rolling(window=self.bb_period).std()
        df['bb_upper_short'] = df['bb_middle_short'] + (df['bb_std_short'] * self.bb_std)
        df['bb_lower_short'] = df['bb_middle_short'] - (df['bb_std_short'] * self.bb_std)
        
        df['bb_middle_long'] = df['close'].rolling(window=self.bb_period * 2).mean()
        df['bb_std_long'] = df['close'].rolling(window=self.bb_period * 2).std()
        df['bb_upper_long'] = df['bb_middle_long'] + (df['bb_std_long'] * self.bb_std)
        df['bb_lower_long'] = df['bb_middle_long'] - (df['bb_std_long'] * self.bb_std)
        
        # Рассчитываем процентную ширину полос
        df['bb_width'] = (df['bbands_upper'] - df['bbands_lower']) / df['bbands_middle']
        
        # Рассчитываем процентное положение цены в полосах
        df['bb_position'] = (df['close'] - df['bbands_lower']) / (df['bbands_upper'] - df['bbands_lower'])
        
        # Определяем сжатие полос
        df['bb_squeeze'] = df['bb_width'] < df['bb_width'].rolling(window=20).mean()
        
        return df
        
    def validate_parameters(self) -> bool:
        """
        Проверяет корректность параметров стратегии.
        
        Returns:
            bool: True если параметры корректны, False в противном случае
        """
        if not super().validate_parameters():
            return False
            
        # Проверяем корректность параметров
        if self.bb_period <= 0:
            return False
            
        if self.bb_std <= 0:
            return False
            
        return True 