import numpy as np
from typing import List, Dict, Any, Tuple
import pandas as pd

def calculate_sma(data: List[float], period: int) -> List[float]:
    """Расчет Simple Moving Average"""
    return pd.Series(data).rolling(window=period).mean().tolist()

def calculate_ema(data: List[float], period: int) -> List[float]:
    """Расчет Exponential Moving Average"""
    return pd.Series(data).ewm(span=period, adjust=False).mean().tolist()

def calculate_rsi(data: List[Dict[str, Any]], period: int = 14) -> List[Dict[str, Any]]:
    """Расчет Relative Strength Index (RSI)"""
    prices = [d['close'] for d in data]
    deltas = np.diff(prices)
    seed = deltas[:period+1]
    up = seed[seed >= 0].sum()/period
    down = -seed[seed < 0].sum()/period
    rs = up/down
    rsi = np.zeros_like(prices)
    rsi[:period] = 100. - 100./(1.+rs)

    for i in range(period, len(prices)):
        delta = deltas[i-1]
        if delta > 0:
            upval = delta
            downval = 0.
        else:
            upval = 0.
            downval = -delta

        up = (up*(period-1) + upval)/period
        down = (down*(period-1) + downval)/period
        rs = up/down
        rsi[i] = 100. - 100./(1.+rs)

    return [{'timestamp': d['timestamp'], 'value': float(r)} for d, r in zip(data, rsi)]

def calculate_macd(data: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Расчет Moving Average Convergence Divergence (MACD)"""
    prices = [d['close'] for d in data]
    ema12 = calculate_ema(prices, 12)
    ema26 = calculate_ema(prices, 26)
    macd_line = [e12 - e26 for e12, e26 in zip(ema12, ema26)]
    signal_line = calculate_ema(macd_line, 9)
    histogram = [m - s for m, s in zip(macd_line, signal_line)]

    return {
        'macd': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, macd_line)],
        'signal': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, signal_line)],
        'histogram': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, histogram)]
    }

def calculate_bollinger_bands(data: List[Dict[str, Any]], period: int = 20, std_dev: float = 2.0) -> Dict[str, List[Dict[str, Any]]]:
    """Расчет Bollinger Bands"""
    prices = [d['close'] for d in data]
    sma = calculate_sma(prices, period)
    std = pd.Series(prices).rolling(window=period).std().tolist()
    
    upper_band = [m + (std_dev * s) for m, s in zip(sma, std)]
    lower_band = [m - (std_dev * s) for m, s in zip(sma, std)]

    return {
        'upper': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, upper_band)],
        'middle': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, sma)],
        'lower': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, lower_band)]
    }

def calculate_stochastic(data: List[Dict[str, Any]], k_period: int = 14, d_period: int = 3) -> Dict[str, List[Dict[str, Any]]]:
    """Расчет Stochastic Oscillator"""
    high_prices = [d['high'] for d in data]
    low_prices = [d['low'] for d in data]
    close_prices = [d['close'] for d in data]

    k_values = []
    for i in range(len(data)):
        if i < k_period - 1:
            k_values.append(50.0)  # Default value
            continue
        
        highest_high = max(high_prices[i-k_period+1:i+1])
        lowest_low = min(low_prices[i-k_period+1:i+1])
        
        if highest_high == lowest_low:
            k_values.append(50.0)
        else:
            k = 100 * ((close_prices[i] - lowest_low) / (highest_high - lowest_low))
            k_values.append(k)

    d_values = calculate_sma(k_values, d_period)

    return {
        'k': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, k_values)],
        'd': [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, d_values)]
    }

def calculate_adx(data: List[Dict[str, Any]], period: int = 14) -> List[Dict[str, Any]]:
    """Расчет Average Directional Index (ADX)"""
    high_prices = [d['high'] for d in data]
    low_prices = [d['low'] for d in data]
    close_prices = [d['close'] for d in data]

    # Calculate True Range
    tr = []
    for i in range(len(data)):
        if i == 0:
            tr.append(high_prices[i] - low_prices[i])
        else:
            tr.append(max(
                high_prices[i] - low_prices[i],
                abs(high_prices[i] - close_prices[i-1]),
                abs(low_prices[i] - close_prices[i-1])
            ))

    # Calculate Directional Movement
    plus_dm = []
    minus_dm = []
    for i in range(len(data)):
        if i == 0:
            plus_dm.append(0)
            minus_dm.append(0)
        else:
            up_move = high_prices[i] - high_prices[i-1]
            down_move = low_prices[i-1] - low_prices[i]
            
            if up_move > down_move and up_move > 0:
                plus_dm.append(up_move)
            else:
                plus_dm.append(0)
                
            if down_move > up_move and down_move > 0:
                minus_dm.append(down_move)
            else:
                minus_dm.append(0)

    # Calculate Smoothed Averages
    tr_smoothed = calculate_sma(tr, period)
    plus_di = [100 * (p/t) if t != 0 else 0 for p, t in zip(calculate_sma(plus_dm, period), tr_smoothed)]
    minus_di = [100 * (m/t) if t != 0 else 0 for m, t in zip(calculate_sma(minus_dm, period), tr_smoothed)]

    # Calculate ADX
    dx = [100 * abs(p - m)/(p + m) if (p + m) != 0 else 0 for p, m in zip(plus_di, minus_di)]
    adx = calculate_sma(dx, period)

    return [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, adx)]

def calculate_obv(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Расчет On-Balance Volume (OBV)"""
    obv = [0]
    for i in range(1, len(data)):
        if data[i]['close'] > data[i-1]['close']:
            obv.append(obv[-1] + data[i]['volume'])
        elif data[i]['close'] < data[i-1]['close']:
            obv.append(obv[-1] - data[i]['volume'])
        else:
            obv.append(obv[-1])

    return [{'timestamp': d['timestamp'], 'value': float(v)} for d, v in zip(data, obv)]

def calculate_ichimoku(data: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Расчет Ichimoku Cloud"""
    high_prices = [d['high'] for d in data]
    low_prices = [d['low'] for d in data]
    close_prices = [d['close'] for d in data]

    # Tenkan-sen (Conversion Line)
    tenkan_period = 9
    tenkan_high = pd.Series(high_prices).rolling(window=tenkan_period).max()
    tenkan_low = pd.Series(low_prices).rolling(window=tenkan_period).min()
    tenkan = ((tenkan_high + tenkan_low) / 2).tolist()

    # Kijun-sen (Base Line)
    kijun_period = 26
    kijun_high = pd.Series(high_prices).rolling(window=kijun_period).max()
    kijun_low = pd.Series(low_prices).rolling(window=kijun_period).min()
    kijun = ((kijun_high + kijun_low) / 2).tolist()

    # Senkou Span A (Leading Span A)
    senkou_a = [((t + k) / 2) for t, k in zip(tenkan, kijun)]
    senkou_a = [None] * kijun_period + senkou_a[:-kijun_period]

    # Senkou Span B (Leading Span B)
    senkou_b_period = 52
    senkou_b_high = pd.Series(high_prices).rolling(window=senkou_b_period).max()
    senkou_b_low = pd.Series(low_prices).rolling(window=senkou_b_period).min()
    senkou_b = ((senkou_b_high + senkou_b_low) / 2).tolist()
    senkou_b = [None] * senkou_b_period + senkou_b[:-senkou_b_period]

    # Chikou Span (Lagging Span)
    chikou = close_prices[kijun_period:] + [None] * kijun_period

    return {
        'tenkan': [{'timestamp': d['timestamp'], 'value': float(v) if v is not None else None} for d, v in zip(data, tenkan)],
        'kijun': [{'timestamp': d['timestamp'], 'value': float(v) if v is not None else None} for d, v in zip(data, kijun)],
        'senkouA': [{'timestamp': d['timestamp'], 'value': float(v) if v is not None else None} for d, v in zip(data, senkou_a)],
        'senkouB': [{'timestamp': d['timestamp'], 'value': float(v) if v is not None else None} for d, v in zip(data, senkou_b)],
        'chikou': [{'timestamp': d['timestamp'], 'value': float(v) if v is not None else None} for d, v in zip(data, chikou)]
    } 