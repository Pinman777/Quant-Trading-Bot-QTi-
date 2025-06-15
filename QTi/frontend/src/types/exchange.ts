export type MarketType = 'spot' | 'futures';

export type ExchangeType = 
  | 'binance'
  | 'bybit'
  | 'okx'
  | 'bingx'
  | 'bitget'
  | 'blofin'
  | 'gate'
  | 'htx'
  | 'lbank'
  | 'mexc'
  | 'hyperliquid'
  | 'weex'
  | 'bitunix';

export interface ExchangeConfig {
  name: ExchangeType;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  markets: MarketType[];
}

export interface ExchangeInfo {
  name: ExchangeType;
  displayName: string;
  supportedMarkets: MarketType[];
  hasTestnet: boolean;
  maxLeverage: number;
  minOrderSize: number;
  tradingFees: {
    maker: number;
    taker: number;
  };
  supportedTimeframes: string[];
  supportedOrderTypes: string[];
}

export interface MarketInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  marketType: MarketType;
  minPrice: number;
  maxPrice: number;
  tickSize: number;
  minQty: number;
  maxQty: number;
  stepSize: number;
  minNotional: number;
  isActive: boolean;
  leverage?: number;
  marginType?: 'isolated' | 'cross';
}

export interface OrderBook {
  symbol: string;
  marketType: MarketType;
  bids: [number, number][]; // [price, quantity]
  asks: [number, number][]; // [price, quantity]
  timestamp: number;
}

export interface Trade {
  symbol: string;
  marketType: MarketType;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
  orderId: string;
  clientOrderId?: string;
}

export interface Order {
  symbol: string;
  marketType: MarketType;
  orderId: string;
  clientOrderId?: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop' | 'stop_limit';
  status: 'new' | 'partially_filled' | 'filled' | 'canceled' | 'rejected';
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  timestamp: number;
  updateTime: number;
  leverage?: number;
  marginType?: 'isolated' | 'cross';
}

export interface Position {
  symbol: string;
  marketType: MarketType;
  side: 'long' | 'short';
  entryPrice: number;
  markPrice: number;
  quantity: number;
  leverage: number;
  marginType: 'isolated' | 'cross';
  liquidationPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  timestamp: number;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface ExchangeStatus {
  isConnected: boolean;
  lastUpdate: number;
  error?: string;
}

export interface ExchangeStats {
  totalTrades: number;
  totalVolume: number;
  winRate: number;
  averagePnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  timestamp: number;
} 