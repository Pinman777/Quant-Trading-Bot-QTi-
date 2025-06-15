export interface BotStats {
  totalBots: number;
  activeBots: number;
  totalProfit: number;
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface BotStatus {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  status: 'running' | 'stopped' | 'error';
  lastUpdate: string;
  lastPrice?: number;
  lastError?: string;
  profit: number;
  trades: number;
  winRate: number;
  config: BotConfig;
}

export interface BotConfig {
  strategy: string;
  timeframe: string;
  leverage?: number;
  positionSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: boolean;
  trailingStopDistance?: number;
  maxPositions?: number;
  maxDrawdown?: number;
  riskPerTrade?: number;
}

export interface BotTrade {
  id: string;
  botId: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  profit?: number;
  status: 'open' | 'closed';
  entryTime: string;
  exitTime?: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface BotPerformance {
  equityCurve: {
    timestamp: string;
    equity: number;
  }[];
  trades: BotTrade[];
  stats: {
    totalTrades: number;
    winRate: number;
    averageProfit: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    expectancy: number;
  };
} 