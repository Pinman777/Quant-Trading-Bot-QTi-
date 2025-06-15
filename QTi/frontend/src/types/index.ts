export interface Bot {
  id: string;
  name: string;
  strategy: string;
  exchange: string;
  symbol: string;
  status: 'running' | 'stopped' | 'error';
  config: Record<string, any>;
}

export interface BacktestResult {
  id: string;
  bot_id: string;
  start_time: string;
  end_time: string;
  status: 'running' | 'completed' | 'error';
  results: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    profit_factor: number;
    total_profit: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
}

export interface OptimizationResult {
  id: string;
  bot_id: string;
  start_time: string;
  end_time: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  best_params: Record<string, any>;
  results: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    profit_factor: number;
    total_profit: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
}

export interface MonitorStatus {
  id: string;
  bot_id: string;
  start_time: string;
  status: 'running' | 'stopped' | 'error';
  metrics: {
    current_profit: number;
    current_drawdown: number;
    win_rate: number;
    profit_factor: number;
    sharpe_ratio: number;
  };
  trades: Array<{
    id: string;
    timestamp: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    profit: number;
  }>;
}

export interface Trade {
  id: string;
  bot_id: string;
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  profit: number;
}

export interface Error {
  code: string;
  message: string;
  details?: Record<string, any>;
} 