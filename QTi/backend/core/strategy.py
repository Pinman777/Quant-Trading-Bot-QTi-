from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
import talib
from sqlalchemy.orm import Session

from ..crud import strategy as crud_strategy
from ..schemas.strategy import StrategyCreate, StrategyUpdate

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

def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Рассчитывает технические индикаторы для стратегии.
    """
    # SMA
    df['SMA_20'] = df['close'].rolling(window=20).mean()
    df['SMA_50'] = df['close'].rolling(window=50).mean()
    
    # EMA
    df['EMA_20'] = df['close'].ewm(span=20, adjust=False).mean()
    df['EMA_50'] = df['close'].ewm(span=50, adjust=False).mean()
    
    # RSI
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # MACD
    exp1 = df['close'].ewm(span=12, adjust=False).mean()
    exp2 = df['close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    # Bollinger Bands
    df['BB_Middle'] = df['close'].rolling(window=20).mean()
    df['BB_Upper'] = df['BB_Middle'] + 2 * df['close'].rolling(window=20).std()
    df['BB_Lower'] = df['BB_Middle'] - 2 * df['close'].rolling(window=20).std()
    
    return df

def generate_signals(df: pd.DataFrame, strategy_params: Dict) -> pd.DataFrame:
    """
    Генерирует торговые сигналы на основе технических индикаторов.
    """
    df['signal'] = 0
    
    # Пример простой стратегии пересечения SMA
    if strategy_params.get('use_sma_crossover', False):
        df['signal'] = np.where(
            df['SMA_20'] > df['SMA_50'],
            1,  # Покупка
            np.where(
                df['SMA_20'] < df['SMA_50'],
                -1,  # Продажа
                0  # Нет сигнала
            )
        )
    
    # Пример стратегии RSI
    if strategy_params.get('use_rsi', False):
        rsi_oversold = strategy_params.get('rsi_oversold', 30)
        rsi_overbought = strategy_params.get('rsi_overbought', 70)
        
        df['signal'] = np.where(
            df['RSI'] < rsi_oversold,
            1,  # Покупка
            np.where(
                df['RSI'] > rsi_overbought,
                -1,  # Продажа
                df['signal']  # Сохраняем предыдущий сигнал
            )
        )
    
    # Пример стратегии MACD
    if strategy_params.get('use_macd', False):
        df['signal'] = np.where(
            (df['MACD'] > df['Signal_Line']) & (df['MACD'].shift(1) <= df['Signal_Line'].shift(1)),
            1,  # Покупка
            np.where(
                (df['MACD'] < df['Signal_Line']) & (df['MACD'].shift(1) >= df['Signal_Line'].shift(1)),
                -1,  # Продажа
                df['signal']  # Сохраняем предыдущий сигнал
            )
        )
    
    # Пример стратегии Bollinger Bands
    if strategy_params.get('use_bollinger', False):
        df['signal'] = np.where(
            df['close'] < df['BB_Lower'],
            1,  # Покупка
            np.where(
                df['close'] > df['BB_Upper'],
                -1,  # Продажа
                df['signal']  # Сохраняем предыдущий сигнал
            )
        )
    
    return df

def calculate_performance_metrics(df: pd.DataFrame) -> Dict:
    """
    Рассчитывает метрики производительности стратегии.
    """
    # Рассчитываем доходность
    df['returns'] = df['close'].pct_change()
    df['strategy_returns'] = df['signal'].shift(1) * df['returns']
    
    # Общая доходность
    total_return = (1 + df['strategy_returns']).prod() - 1
    
    # Годовая доходность
    annual_return = (1 + total_return) ** (252 / len(df)) - 1
    
    # Волатильность
    volatility = df['strategy_returns'].std() * np.sqrt(252)
    
    # Коэффициент Шарпа
    risk_free_rate = 0.02  # Предполагаемая безрисковая ставка
    sharpe_ratio = (annual_return - risk_free_rate) / volatility
    
    # Максимальная просадка
    cumulative_returns = (1 + df['strategy_returns']).cumprod()
    rolling_max = cumulative_returns.expanding().max()
    drawdowns = cumulative_returns / rolling_max - 1
    max_drawdown = drawdowns.min()
    
    # Количество сделок
    trades = df['signal'].diff().abs().sum() / 2
    
    # Процент выигрышных сделок
    winning_trades = df[df['strategy_returns'] > 0]['strategy_returns'].count()
    win_rate = winning_trades / trades if trades > 0 else 0
    
    return {
        'total_return': total_return,
        'annual_return': annual_return,
        'volatility': volatility,
        'sharpe_ratio': sharpe_ratio,
        'max_drawdown': max_drawdown,
        'trades': trades,
        'win_rate': win_rate
    }

def backtest_strategy(
    df: pd.DataFrame,
    strategy_params: Dict,
    initial_capital: float = 10000.0
) -> Dict:
    """
    Выполняет бэктестинг стратегии.
    """
    # Рассчитываем индикаторы
    df = calculate_technical_indicators(df)
    
    # Генерируем сигналы
    df = generate_signals(df, strategy_params)
    
    # Рассчитываем позиции
    df['position'] = df['signal'].cumsum()
    
    # Рассчитываем капитал
    df['capital'] = initial_capital * (1 + df['strategy_returns']).cumprod()
    
    # Рассчитываем метрики
    metrics = calculate_performance_metrics(df)
    
    return {
        'metrics': metrics,
        'equity_curve': df['capital'].tolist(),
        'positions': df['position'].tolist(),
        'signals': df['signal'].tolist()
    }

def optimize_strategy_parameters(
    df: pd.DataFrame,
    param_grid: Dict,
    metric: str = 'sharpe_ratio'
) -> Dict:
    """
    Оптимизирует параметры стратегии.
    """
    best_params = {}
    best_score = float('-inf')
    
    # Генерируем все комбинации параметров
    param_combinations = [dict(zip(param_grid.keys(), v)) for v in np.array(np.meshgrid(*param_grid.values())).T.reshape(-1, len(param_grid))]
    
    for params in param_combinations:
        # Выполняем бэктест
        results = backtest_strategy(df, params)
        
        # Получаем метрику
        score = results['metrics'][metric]
        
        # Обновляем лучшие параметры
        if score > best_score:
            best_score = score
            best_params = params
    
    return {
        'best_params': best_params,
        'best_score': best_score
    } 