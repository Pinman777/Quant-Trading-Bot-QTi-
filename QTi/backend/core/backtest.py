import asyncio
import logging
from datetime import datetime
from pathlib import Path
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List
import ccxt.async_support as ccxt
from ..config import settings
from .technical_analysis import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands
)

logger = logging.getLogger(__name__)

class BacktestManager:
    def __init__(self, bot_path: str):
        self.bot_path = Path(bot_path)
        self.exchanges = {}
        
    async def get_exchange(self, exchange_id: str) -> ccxt.Exchange:
        """Получить или создать экземпляр биржи"""
        if exchange_id not in self.exchanges:
            exchange_class = getattr(ccxt, exchange_id)
            self.exchanges[exchange_id] = exchange_class({
                'enableRateLimit': True,
                'options': {
                    'defaultType': 'spot'
                }
            })
        return self.exchanges[exchange_id]
        
    async def load_historical_data(
        self,
        exchange_id: str,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """Загрузить исторические данные"""
        exchange = await self.get_exchange(exchange_id)
        
        # Конвертируем даты в миллисекунды
        since = int(start_date.timestamp() * 1000)
        end = int(end_date.timestamp() * 1000)
        
        # Загружаем данные
        ohlcv = []
        while since < end:
            try:
                data = await exchange.fetch_ohlcv(symbol, timeframe, since)
                if not data:
                    break
                    
                ohlcv.extend(data)
                since = data[-1][0] + 1
                
                # Соблюдаем ограничение запросов
                await exchange.sleep(exchange.rateLimit / 1000)
                
            except Exception as e:
                logger.error(f"Ошибка при загрузке данных: {str(e)}")
                break
                
        # Создаем DataFrame
        df = pd.DataFrame(
            ohlcv,
            columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
        )
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        return df
        
    async def run_backtest(
        self,
        config_path: str,
        start_date: datetime,
        end_date: datetime,
        results_dir: str
    ) -> Dict[str, Any]:
        """Запустить бэктест"""
        try:
            # Загружаем конфигурацию бота
            with open(config_path, 'r') as f:
                config = json.load(f)
                
            # Загружаем исторические данные
            df = await self.load_historical_data(
                config['exchange'],
                config['symbol'],
                config['timeframe'],
                start_date,
                end_date
            )
            
            # Инициализируем переменные для бэктеста
            initial_balance = config.get('initial_balance', 10000)
            balance = initial_balance
            position = 0
            trades = []
            equity = []
            
            # Загружаем стратегию
            strategy_path = self.bot_path / 'strategies' / f"{config['strategy']}.py"
            if not strategy_path.exists():
                raise ValueError(f"Стратегия {config['strategy']} не найдена")
                
            # Импортируем стратегию
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                config['strategy'],
                strategy_path
            )
            strategy_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(strategy_module)
            
            # Создаем экземпляр стратегии
            strategy = strategy_module.Strategy(config['parameters'])
            
            # Запускаем бэктест
            for i in range(len(df)):
                current_bar = df.iloc[i]
                
                # Получаем сигнал от стратегии
                signal = strategy.generate_signal(df.iloc[:i+1])
                
                # Обрабатываем сигнал
                if signal == 1 and position <= 0:  # Покупка
                    if position < 0:  # Закрываем короткую позицию
                        close_price = current_bar['close']
                        pnl = (entry_price - close_price) * abs(position)
                        balance += pnl
                        trades.append({
                            'timestamp': current_bar.name,
                            'type': 'close_short',
                            'price': close_price,
                            'size': abs(position),
                            'pnl': pnl
                        })
                        
                    # Открываем длинную позицию
                    position = balance / current_bar['close']
                    entry_price = current_bar['close']
                    trades.append({
                        'timestamp': current_bar.name,
                        'type': 'open_long',
                        'price': entry_price,
                        'size': position
                    })
                    
                elif signal == -1 and position >= 0:  # Продажа
                    if position > 0:  # Закрываем длинную позицию
                        close_price = current_bar['close']
                        pnl = (close_price - entry_price) * position
                        balance += pnl
                        trades.append({
                            'timestamp': current_bar.name,
                            'type': 'close_long',
                            'price': close_price,
                            'size': position,
                            'pnl': pnl
                        })
                        
                    # Открываем короткую позицию
                    position = -balance / current_bar['close']
                    entry_price = current_bar['close']
                    trades.append({
                        'timestamp': current_bar.name,
                        'type': 'open_short',
                        'price': entry_price,
                        'size': abs(position)
                    })
                    
                # Записываем текущую эквити
                current_equity = balance
                if position != 0:
                    if position > 0:
                        current_equity += (current_bar['close'] - entry_price) * position
                    else:
                        current_equity += (entry_price - current_bar['close']) * abs(position)
                        
                equity.append({
                    'timestamp': current_bar.name,
                    'equity': current_equity
                })
                
            # Закрываем последнюю позицию
            if position != 0:
                close_price = df.iloc[-1]['close']
                if position > 0:
                    pnl = (close_price - entry_price) * position
                else:
                    pnl = (entry_price - close_price) * abs(position)
                balance += pnl
                trades.append({
                    'timestamp': df.index[-1],
                    'type': 'close_long' if position > 0 else 'close_short',
                    'price': close_price,
                    'size': abs(position),
                    'pnl': pnl
                })
                
            # Сохраняем результаты
            results_dir = Path(results_dir)
            results_dir.mkdir(parents=True, exist_ok=True)
            
            # Сохраняем сделки
            trades_df = pd.DataFrame(trades)
            trades_df.to_csv(results_dir / 'trades.csv', index=False)
            
            # Сохраняем эквити
            equity_df = pd.DataFrame(equity)
            equity_df.to_csv(results_dir / 'equity.csv', index=False)

        # Рассчитываем метрики
            final_balance = balance
            total_return = (final_balance - initial_balance) / initial_balance * 100
            
            # Рассчитываем просадку
            equity_series = pd.Series([e['equity'] for e in equity])
            rolling_max = equity_series.expanding().max()
            drawdown = (equity_series - rolling_max) / rolling_max * 100
            max_drawdown = drawdown.min()
            
            # Рассчитываем метрики по сделкам
            if trades:
                trades_df = pd.DataFrame(trades)
                winning_trades = trades_df[trades_df['pnl'] > 0]
                win_rate = len(winning_trades) / len(trades) * 100
                avg_win = winning_trades['pnl'].mean() if len(winning_trades) > 0 else 0
                avg_loss = trades_df[trades_df['pnl'] < 0]['pnl'].mean() if len(trades_df[trades_df['pnl'] < 0]) > 0 else 0
                profit_factor = abs(winning_trades['pnl'].sum() / trades_df[trades_df['pnl'] < 0]['pnl'].sum()) if len(trades_df[trades_df['pnl'] < 0]) > 0 else float('inf')
            else:
                win_rate = 0
                avg_win = 0
                avg_loss = 0
                profit_factor = 0
                
            # Формируем результаты
            results = {
                'initial_balance': initial_balance,
                'final_balance': final_balance,
                'total_return': total_return,
                'max_drawdown': max_drawdown,
                'win_rate': win_rate,
                'avg_win': avg_win,
                'avg_loss': avg_loss,
                'profit_factor': profit_factor,
                'total_trades': len(trades),
                'winning_trades': len(winning_trades) if trades else 0,
                'losing_trades': len(trades_df[trades_df['pnl'] < 0]) if trades else 0
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Ошибка при выполнении бэктеста: {str(e)}")
            raise
            
    async def close(self):
        """Закрыть все соединения с биржами"""
        for exchange in self.exchanges.values():
            await exchange.close()

class BacktestEngine:
    def __init__(
        self,
        symbol: str,
        timeframe: str,
        initial_balance: float = 10000.0,
        commission: float = 0.001
    ):
        self.symbol = symbol
        self.timeframe = timeframe
        self.initial_balance = initial_balance
        self.commission = commission
        self.balance = initial_balance
        self.position = 0
        self.trades: List[Dict[str, Any]] = []
        self.equity_curve: List[Dict[str, Any]] = []

    def run(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Запуск бэктеста на исторических данных
        """
        # Конвертируем данные в pandas DataFrame
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)

        # Рассчитываем технические индикаторы
        df['sma20'] = calculate_sma(df['close'], 20)
        df['sma50'] = calculate_sma(df['close'], 50)
        df['rsi'] = calculate_rsi(df['close'])
        macd_data = calculate_macd(df['close'])
        df['macd'] = macd_data['macd']
        df['signal'] = macd_data['signal']
        bollinger_data = calculate_bollinger_bands(df['close'])
        df['upper_band'] = bollinger_data['upper']
        df['lower_band'] = bollinger_data['lower']

        # Инициализируем переменные для отслеживания результатов
        self.balance = self.initial_balance
        self.position = 0
        self.trades = []
        self.equity_curve = []

        # Проходим по всем свечам
        for i in range(1, len(df)):
            current_price = df['close'].iloc[i]
            timestamp = df.index[i]

            # Сигналы для входа в позицию
            long_signal = (
                df['sma20'].iloc[i] > df['sma50'].iloc[i] and
                df['rsi'].iloc[i] < 30 and
                df['macd'].iloc[i] > df['signal'].iloc[i] and
                current_price < df['lower_band'].iloc[i]
            )

            short_signal = (
                df['sma20'].iloc[i] < df['sma50'].iloc[i] and
                df['rsi'].iloc[i] > 70 and
                df['macd'].iloc[i] < df['signal'].iloc[i] and
                current_price > df['upper_band'].iloc[i]
            )

            # Закрытие позиций
            if self.position > 0 and short_signal:
                self._close_position(current_price, timestamp, 'long')
            elif self.position < 0 and long_signal:
                self._close_position(current_price, timestamp, 'short')

            # Открытие новых позиций
            if self.position == 0:
                if long_signal:
                    self._open_position(current_price, timestamp, 'long')
                elif short_signal:
                    self._open_position(current_price, timestamp, 'short')

            # Обновляем кривую капитала
            self.equity_curve.append({
                'timestamp': timestamp.isoformat(),
                'equity': self.balance + self.position * current_price
            })

        # Рассчитываем метрики производительности
        equity_series = pd.Series([point['equity'] for point in self.equity_curve])
        returns = equity_series.pct_change().dropna()
        
        total_trades = len(self.trades)
        winning_trades = len([t for t in self.trades if t['pnl'] > 0])
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0

        profit_trades = [t['pnl'] for t in self.trades if t['pnl'] > 0]
        loss_trades = [abs(t['pnl']) for t in self.trades if t['pnl'] < 0]
        profit_factor = (
            sum(profit_trades) / sum(loss_trades)
            if sum(loss_trades) > 0
            else float('inf')
        )

        max_drawdown = self._calculate_max_drawdown(equity_series)
        sharpe_ratio = self._calculate_sharpe_ratio(returns)

        return {
            'final_balance': self.balance,
            'total_trades': total_trades,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'max_drawdown': max_drawdown,
            'sharpe_ratio': sharpe_ratio,
            'equity_curve': self.equity_curve,
            'trades': self.trades
        }

    def _open_position(self, price: float, timestamp: datetime, direction: str):
        """Открытие новой позиции"""
        size = self.balance * 0.95 / price  # Используем 95% баланса
        if direction == 'short':
            size = -size

        self.position = size
        self.trades.append({
            'timestamp': timestamp.isoformat(),
            'type': direction,
            'entryPrice': price,
            'exitPrice': None,
            'pnl': None
        })

    def _close_position(self, price: float, timestamp: datetime, direction: str):
        """Закрытие существующей позиции"""
        pnl = (price - self.trades[-1]['entryPrice']) * self.position
        pnl -= abs(self.position * price * self.commission)  # Комиссия

        self.balance += pnl
        self.trades[-1]['exitPrice'] = price
        self.trades[-1]['pnl'] = pnl
        self.position = 0

    def _calculate_max_drawdown(self, equity_series: pd.Series) -> float:
        """Расчет максимальной просадки"""
        rolling_max = equity_series.expanding().max()
        drawdowns = equity_series / rolling_max - 1
        return abs(drawdowns.min()) * 100

    def _calculate_sharpe_ratio(self, returns: pd.Series) -> float:
        """Расчет коэффициента Шарпа"""
        if len(returns) < 2:
            return 0
        return np.sqrt(252) * returns.mean() / returns.std() 