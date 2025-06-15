from typing import Dict, List, Any, Callable
import numpy as np
import pandas as pd
from dataclasses import dataclass
from .technical_analysis import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_stochastic,
    calculate_adx,
    calculate_ichimoku
)

@dataclass
class StrategyParams:
    """Параметры торговой стратегии"""
    name: str
    params: Dict[str, Any]

class TradingStrategy:
    """Базовый класс для торговых стратегий"""
    def __init__(self, params: StrategyParams):
        self.params = params

    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        """Генерация торговых сигналов"""
        raise NotImplementedError

class MovingAverageCrossover(TradingStrategy):
    """Стратегия пересечения скользящих средних"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        fast_period = self.params.params.get('fast_period', 20)
        slow_period = self.params.params.get('slow_period', 50)
        
        data['fast_ma'] = calculate_sma(data['close'], fast_period)
        data['slow_ma'] = calculate_sma(data['close'], slow_period)
        
        data['signal'] = 0
        data.loc[data['fast_ma'] > data['slow_ma'], 'signal'] = 1
        data.loc[data['fast_ma'] < data['slow_ma'], 'signal'] = -1
        
        return data

class RSIStrategy(TradingStrategy):
    """Стратегия на основе RSI"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        period = self.params.params.get('period', 14)
        overbought = self.params.params.get('overbought', 70)
        oversold = self.params.params.get('oversold', 30)
        
        data['rsi'] = calculate_rsi(data['close'], period)
        
        data['signal'] = 0
        data.loc[data['rsi'] < oversold, 'signal'] = 1
        data.loc[data['rsi'] > overbought, 'signal'] = -1
        
        return data

class MACDStrategy(TradingStrategy):
    """Стратегия на основе MACD"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        fast_period = self.params.params.get('fast_period', 12)
        slow_period = self.params.params.get('slow_period', 26)
        signal_period = self.params.params.get('signal_period', 9)
        
        macd_data = calculate_macd(
            data['close'],
            fast_period=fast_period,
            slow_period=slow_period,
            signal_period=signal_period
        )
        
        data['macd'] = macd_data['macd']
        data['signal_line'] = macd_data['signal']
        
        data['signal'] = 0
        data.loc[data['macd'] > data['signal_line'], 'signal'] = 1
        data.loc[data['macd'] < data['signal_line'], 'signal'] = -1
        
        return data

class BollingerBandsStrategy(TradingStrategy):
    """Стратегия на основе полос Боллинджера"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        period = self.params.params.get('period', 20)
        std_dev = self.params.params.get('std_dev', 2)
        
        bb_data = calculate_bollinger_bands(
            data['close'],
            period=period,
            std_dev=std_dev
        )
        
        data['upper_band'] = bb_data['upper']
        data['lower_band'] = bb_data['lower']
        data['middle_band'] = bb_data['middle']
        
        data['signal'] = 0
        data.loc[data['close'] < data['lower_band'], 'signal'] = 1
        data.loc[data['close'] > data['upper_band'], 'signal'] = -1
        
        return data

class IchimokuStrategy(TradingStrategy):
    """Стратегия на основе облака Ишимоку"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        tenkan_period = self.params.params.get('tenkan_period', 9)
        kijun_period = self.params.params.get('kijun_period', 26)
        senkou_span_b_period = self.params.params.get('senkou_span_b_period', 52)
        
        ichimoku_data = calculate_ichimoku(
            data['close'],
            tenkan_period=tenkan_period,
            kijun_period=kijun_period,
            senkou_span_b_period=senkou_span_b_period
        )
        
        data['tenkan_sen'] = ichimoku_data['tenkan_sen']
        data['kijun_sen'] = ichimoku_data['kijun_sen']
        data['senkou_span_a'] = ichimoku_data['senkou_span_a']
        data['senkou_span_b'] = ichimoku_data['senkou_span_b']
        
        data['signal'] = 0
        data.loc[
            (data['tenkan_sen'] > data['kijun_sen']) & 
            (data['close'] > data['senkou_span_a']) & 
            (data['close'] > data['senkou_span_b']),
            'signal'
        ] = 1
        data.loc[
            (data['tenkan_sen'] < data['kijun_sen']) & 
            (data['close'] < data['senkou_span_a']) & 
            (data['close'] < data['senkou_span_b']),
            'signal'
        ] = -1
        
        return data

class ADXStrategy(TradingStrategy):
    """Стратегия на основе ADX"""
    def generate_signals(self, data: pd.DataFrame) -> pd.DataFrame:
        period = self.params.params.get('period', 14)
        adx_threshold = self.params.params.get('adx_threshold', 25)
        
        adx_data = calculate_adx(data['high'], data['low'], data['close'], period)
        
        data['adx'] = adx_data['adx']
        data['plus_di'] = adx_data['plus_di']
        data['minus_di'] = adx_data['minus_di']
        
        data['signal'] = 0
        data.loc[
            (data['adx'] > adx_threshold) & 
            (data['plus_di'] > data['minus_di']),
            'signal'
        ] = 1
        data.loc[
            (data['adx'] > adx_threshold) & 
            (data['plus_di'] < data['minus_di']),
            'signal'
        ] = -1
        
        return data

class StrategyFactory:
    """Фабрика для создания торговых стратегий"""
    _strategies = {
        'ma_crossover': MovingAverageCrossover,
        'rsi': RSIStrategy,
        'macd': MACDStrategy,
        'bollinger_bands': BollingerBandsStrategy,
        'ichimoku': IchimokuStrategy,
        'adx': ADXStrategy
    }

    @classmethod
    def create_strategy(cls, strategy_name: str, params: Dict[str, Any]) -> TradingStrategy:
        """Создание стратегии по имени"""
        if strategy_name not in cls._strategies:
            raise ValueError(f"Unknown strategy: {strategy_name}")
        
        strategy_class = cls._strategies[strategy_name]
        return strategy_class(StrategyParams(strategy_name, params))

    @classmethod
    def get_available_strategies(cls) -> List[str]:
        """Получение списка доступных стратегий"""
        return list(cls._strategies.keys())

    @classmethod
    def get_default_params(cls, strategy_name: str) -> Dict[str, Any]:
        """Получение параметров по умолчанию для стратегии"""
        if strategy_name == 'ma_crossover':
            return {'fast_period': 20, 'slow_period': 50}
        elif strategy_name == 'rsi':
            return {'period': 14, 'overbought': 70, 'oversold': 30}
        elif strategy_name == 'macd':
            return {'fast_period': 12, 'slow_period': 26, 'signal_period': 9}
        elif strategy_name == 'bollinger_bands':
            return {'period': 20, 'std_dev': 2}
        elif strategy_name == 'ichimoku':
            return {
                'tenkan_period': 9,
                'kijun_period': 26,
                'senkou_span_b_period': 52
            }
        elif strategy_name == 'adx':
            return {'period': 14, 'adx_threshold': 25}
        else:
            raise ValueError(f"Unknown strategy: {strategy_name}") 