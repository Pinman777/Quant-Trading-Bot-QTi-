import { api } from './api';

export interface Bot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  exchange: string;
  symbol: string;
  strategy: string;
  pnl: number;
  pnlPercent: number;
  openPositions: number;
  totalTrades: number;
  winRate: number;
  lastUpdate: string;
  error?: string;
}

export interface CreateBotDto {
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  config: Record<string, any>;
}

export interface UpdateBotDto {
  name?: string;
  config?: Record<string, any>;
}

export const botService = {
  async getUserBots(userId: string): Promise<Bot[]> {
    const response = await api.get(`/users/${userId}/bots`);
    return response.data;
  },

  async getBot(botId: string): Promise<Bot> {
    const response = await api.get(`/bots/${botId}`);
    return response.data;
  },

  async createBot(data: CreateBotDto): Promise<Bot> {
    const response = await api.post('/bots', data);
    return response.data;
  },

  async updateBot(botId: string, data: UpdateBotDto): Promise<Bot> {
    const response = await api.put(`/bots/${botId}`, data);
    return response.data;
  },

  async deleteBot(botId: string): Promise<void> {
    await api.delete(`/bots/${botId}`);
  },

  async startBot(botId: string): Promise<Bot> {
    const response = await api.post(`/bots/${botId}/start`);
    return response.data;
  },

  async stopBot(botId: string): Promise<Bot> {
    const response = await api.post(`/bots/${botId}/stop`);
    return response.data;
  },

  async getBotLogs(botId: string, limit: number = 100): Promise<string[]> {
    const response = await api.get(`/bots/${botId}/logs`, {
      params: { limit }
    });
    return response.data;
  },

  async getBotStats(botId: string): Promise<{
    totalTrades: number;
    winRate: number;
    pnl: number;
    pnlPercent: number;
    openPositions: number;
  }> {
    const response = await api.get(`/bots/${botId}/stats`);
    return response.data;
  }
}; 