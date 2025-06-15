from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import talib

class Strategy(ABC):
    def __init__(self, parameters: Dict[str, Any]):
        self.parameters = parameters
        
    @abstractmethod
    def generate_signal(self, data: pd.DataFrame) -> int:
        """
        Генерирует торговый сигнал на основе исторических данных.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            int: 1 для покупки, -1 для продажи, 0 для отсутствия сигнала
        """
        pass
        
    def calculate_indicators(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Рассчитывает технические индикаторы для стратегии.
        
        Args:
            data: DataFrame с историческими данными (OHLCV)
            
        Returns:
            pd.DataFrame: DataFrame с добавленными индикаторами
        """
        df = data.copy()
        
        # Добавляем базовые индикаторы
        df['sma_20'] = talib.SMA(df['close'], timeperiod=20)
        df['sma_50'] = talib.SMA(df['close'], timeperiod=50)
        df['sma_200'] = talib.SMA(df['close'], timeperiod=200)
        
        df['ema_20'] = talib.EMA(df['close'], timeperiod=20)
        df['ema_50'] = talib.EMA(df['close'], timeperiod=50)
        df['ema_200'] = talib.EMA(df['close'], timeperiod=200)
        
        df['rsi'] = talib.RSI(df['close'], timeperiod=14)
        
        df['macd'], df['macd_signal'], df['macd_hist'] = talib.MACD(
            df['close'],
            fastperiod=12,
            slowperiod=26,
            signalperiod=9
        )
        
        df['bbands_upper'], df['bbands_middle'], df['bbands_lower'] = talib.BBANDS(
            df['close'],
            timeperiod=20,
            nbdevup=2,
            nbdevdn=2,
            matype=0
        )
        
        df['atr'] = talib.ATR(
            df['high'],
            df['low'],
            df['close'],
            timeperiod=14
        )
        
        df['adx'] = talib.ADX(
            df['high'],
            df['low'],
            df['close'],
            timeperiod=14
        )
        
        df['obv'] = talib.OBV(df['close'], df['volume'])
        
        df['stoch_k'], df['stoch_d'] = talib.STOCH(
            df['high'],
            df['low'],
            df['close'],
            fastk_period=14,
            slowk_period=3,
            slowk_matype=0,
            slowd_period=3,
            slowd_matype=0
        )
        
        df['willr'] = talib.WILLR(
            df['high'],
            df['low'],
            df['close'],
            timeperiod=14
        )
        
        df['cci'] = talib.CCI(
            df['high'],
            df['low'],
            df['close'],
            timeperiod=14
        )
        
        df['mfi'] = talib.MFI(
            df['high'],
            df['low'],
            df['close'],
            df['volume'],
            timeperiod=14
        )
        
        df['roc'] = talib.ROC(df['close'], timeperiod=10)
        
        df['mom'] = talib.MOM(df['close'], timeperiod=10)
        
        df['ppo'] = talib.PPO(
            df['close'],
            fastperiod=12,
            slowperiod=26,
            matype=0
        )
        
        df['trix'] = talib.TRIX(df['close'], timeperiod=30)
        
        df['aroon_up'], df['aroon_down'] = talib.AROON(
            df['high'],
            df['low'],
            timeperiod=25
        )
        
        df['ad'] = talib.AD(
            df['high'],
            df['low'],
            df['close'],
            df['volume']
        )
        
        df['adosc'] = talib.ADOSC(
            df['high'],
            df['low'],
            df['close'],
            df['volume'],
            fastperiod=3,
            slowperiod=10
        )
        
        return df
        
    def calculate_position_size(
        self,
        balance: float,
        price: float,
        risk_per_trade: float = 0.02,
        stop_loss: Optional[float] = None
    ) -> float:
        """
        Рассчитывает размер позиции на основе управления рисками.
        
        Args:
            balance: Текущий баланс
            price: Текущая цена
            risk_per_trade: Процент риска на сделку (по умолчанию 2%)
            stop_loss: Цена стоп-лосса (если None, используется ATR)
            
        Returns:
            float: Размер позиции в единицах актива
        """
        risk_amount = balance * risk_per_trade
        
        if stop_loss is None:
            # Используем ATR для расчета стоп-лосса
            atr = self.parameters.get('atr', 0.02)  # 2% от цены по умолчанию
            stop_loss = price * (1 - atr)
            
        risk_per_unit = abs(price - stop_loss)
        if risk_per_unit == 0:
            return 0
            
        position_size = risk_amount / risk_per_unit
        return position_size
        
    def calculate_stop_loss(
        self,
        price: float,
        atr_multiplier: float = 2.0,
        atr_period: int = 14
    ) -> float:
        """
        Рассчитывает уровень стоп-лосса на основе ATR.
        
        Args:
            price: Текущая цена
            atr_multiplier: Множитель ATR
            atr_period: Период для расчета ATR
            
        Returns:
            float: Цена стоп-лосса
        """
        atr = self.parameters.get('atr', price * 0.02)  # 2% от цены по умолчанию
        return price * (1 - atr * atr_multiplier)
        
    def calculate_take_profit(
        self,
        price: float,
        risk_reward_ratio: float = 2.0,
        stop_loss: Optional[float] = None
    ) -> float:
        """
        Рассчитывает уровень тейк-профита на основе соотношения риск/доходность.
        
        Args:
            price: Текущая цена
            risk_reward_ratio: Соотношение риск/доходность
            stop_loss: Цена стоп-лосса
            
        Returns:
            float: Цена тейк-профита
        """
        if stop_loss is None:
            stop_loss = self.calculate_stop_loss(price)
            
        risk = abs(price - stop_loss)
        return price + (risk * risk_reward_ratio)
        
    def validate_parameters(self) -> bool:
        """
        Проверяет корректность параметров стратегии.
        
        Returns:
            bool: True если параметры корректны, False в противном случае
        """
        required_params = self.parameters.get('required_parameters', [])
        for param in required_params:
            if param not in self.parameters:
                return False
        return True 