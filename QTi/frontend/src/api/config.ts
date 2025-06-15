export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  BOTS: `${API_BASE_URL}/api/bots`,
  BACKTEST: `${API_BASE_URL}/api/backtest`,
  OPTIMIZER: `${API_BASE_URL}/api/optimizer`,
  MONITOR: `${API_BASE_URL}/api/monitor`,
  WEBSOCKET: `${API_BASE_URL}/ws`,
} as const;

export const WEBSOCKET_EVENTS = {
  BOT_STATUS: 'bot_status',
  TRADE: 'trade',
  ERROR: 'error',
} as const; 