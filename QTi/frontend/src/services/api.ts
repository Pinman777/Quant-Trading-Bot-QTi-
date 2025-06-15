import axios from 'axios';
import { authService } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.isAuthenticated() ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Bot management
export const botApi = {
  getBots: () => api.get('/api/bots'),
  getBot: (id: string) => api.get(`/api/bots/${id}`),
  addBot: (bot: any) => api.post('/bots', bot),
  updateBot: (id: string, bot: any) => api.put(`/bots/${id}`, bot),
  deleteBot: (id: string) => api.delete(`/bots/${id}`),
  startBot: (id: string) => api.post(`/api/bots/${id}/start`),
  stopBot: (id: string) => api.post(`/api/bots/${id}/stop`),
  refreshBot: (id: string) => api.post(`/bots/${id}/refresh`),
  getBotChartData: (id: string) => api.get(`/api/bots/${id}/chart`),
  getTrades: () => api.get('/api/trades'),
  getBotTrades: (botId: string) => api.get(`/api/bots/${botId}/trades`),
};

// Backtesting
export const backtestApi = {
  getSymbols: () => api.get('/api/backtest/symbols'),
  getTimeframes: () => api.get('/api/backtest/timeframes'),
  runBacktest: (params: any) => api.post('/api/backtest/run', params),
  getResults: () => api.get('/api/backtest/results'),
  getResult: (id: string) => api.get(`/api/backtest/results/${id}`),
  deleteResult: async (resultId: string) => {
    const response = await api.delete(`/backtest/results/${resultId}`);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/backtest/history');
    return response.data;
  },
};

// Optimization
export const optimizationApi = {
  getSymbols: () => api.get('/optimization/symbols'),
  getTimeframes: () => api.get('/optimization/timeframes'),
  getResults: () => api.get('/optimization/results'),
  getResult: (id: string) => api.get(`/optimization/results/${id}`),
  startOptimization: (config: any) => api.post('/optimization/start', config),
  getStatus: (id: string) => api.get(`/optimization/status/${id}`),
  stopOptimization: (id: string) => api.post(`/optimization/stop/${id}`),
  deleteResult: (id: string) => api.delete(`/optimization/results/${id}`),
};

// Settings
export const settingsApi = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings: any) => api.put('/api/settings', settings),
};

// Authentication
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; password: string; email: string }) =>
    api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Market data
export const marketApi = {
  getMarketData: () => api.get('/api/market/data'),
  getSymbolInfo: (symbol: string) => api.get(`/api/market/symbols/${symbol}`),
  getSymbols: () => api.get('/market/symbols'),
  getTimeframes: () => api.get('/market/timeframes'),
  getKlines: (symbol: string, interval: string, limit: number) =>
    api.get(`/market/klines/${symbol}`, { params: { interval, limit } }),
  getTicker: (symbol: string) => api.get(`/market/ticker/${symbol}`),
  getCoins: () => api.get('/market/coins'),
  getGlobalMetrics: () => api.get('/market/global'),
};

// Server API
export const serverApi = {
  getServers: () => api.get('/servers'),
  getServer: (id: string) => api.get(`/servers/${id}`),
  addServer: (data: any) => api.post('/servers', data),
  updateServer: (id: string, data: any) => api.put(`/servers/${id}`, data),
  deleteServer: (id: string) => api.delete(`/servers/${id}`),
  startServer: (id: string) => api.post(`/servers/${id}/start`),
  stopServer: (id: string) => api.post(`/servers/${id}/stop`),
  refreshServer: (id: string) => api.post(`/servers/${id}/refresh`),
  syncToServer: (id: string) => api.post(`/servers/${id}/sync-to`),
  syncFromServer: (id: string) => api.post(`/servers/${id}/sync-from`),
};

export const strategyApi = {
  getStrategies: () => api.get('/strategies'),
  getStrategy: (id: string) => api.get(`/strategies/${id}`),
  addStrategy: (strategy: any) => api.post('/strategies', strategy),
  updateStrategy: (id: string, strategy: any) => api.put(`/strategies/${id}`, strategy),
  deleteStrategy: (id: string) => api.delete(`/strategies/${id}`),
  startStrategy: (id: string) => api.post(`/strategies/${id}/start`),
  stopStrategy: (id: string) => api.post(`/strategies/${id}/stop`),
  refreshStrategy: (id: string) => api.post(`/strategies/${id}/refresh`),
}; 