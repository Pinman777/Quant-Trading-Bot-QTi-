import api from './api';

export interface Server {
  id: string;
  name: string;
  host: string;
  username: string;
  port: number;
  status?: 'online' | 'offline';
  lastSync?: string;
}

export interface Bot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  config: any;
  lastUpdate: string;
}

export const remoteService = {
  // Servers
  async getServers(): Promise<Server[]> {
    const response = await api.get('/remote/servers');
    return response.data;
  },

  async getServer(id: string): Promise<Server> {
    const response = await api.get(`/remote/servers/${id}`);
    return response.data;
  },

  async createServer(server: Omit<Server, 'id'>): Promise<Server> {
    const response = await api.post('/remote/servers', server);
    return response.data;
  },

  async updateServer(id: string, server: Partial<Server>): Promise<Server> {
    const response = await api.put(`/remote/servers/${id}`, server);
    return response.data;
  },

  async deleteServer(id: string): Promise<void> {
    await api.delete(`/remote/servers/${id}`);
  },

  async syncServer(id: string): Promise<void> {
    await api.post(`/remote/servers/${id}/sync`);
  },

  // Bots
  async getBots(serverId: string): Promise<Bot[]> {
    const response = await api.get(`/remote/servers/${serverId}/bots`);
    return response.data;
  },

  async getBot(serverId: string, botId: string): Promise<Bot> {
    const response = await api.get(`/remote/servers/${serverId}/bots/${botId}`);
    return response.data;
  },

  async createBot(serverId: string, bot: Omit<Bot, 'id'>): Promise<Bot> {
    const response = await api.post(`/remote/servers/${serverId}/bots`, bot);
    return response.data;
  },

  async updateBot(
    serverId: string,
    botId: string,
    bot: Partial<Bot>
  ): Promise<Bot> {
    const response = await api.put(
      `/remote/servers/${serverId}/bots/${botId}`,
      bot
    );
    return response.data;
  },

  async deleteBot(serverId: string, botId: string): Promise<void> {
    await api.delete(`/remote/servers/${serverId}/bots/${botId}`);
  },

  async startBot(serverId: string, botId: string): Promise<void> {
    await api.post(`/remote/servers/${serverId}/bots/${botId}/start`);
  },

  async stopBot(serverId: string, botId: string): Promise<void> {
    await api.post(`/remote/servers/${serverId}/bots/${botId}/stop`);
  },

  async getBotLogs(
    serverId: string,
    botId: string,
    limit: number = 100
  ): Promise<string[]> {
    const response = await api.get(
      `/remote/servers/${serverId}/bots/${botId}/logs`,
      { params: { limit } }
    );
    return response.data;
  },

  async getBotStats(
    serverId: string,
    botId: string
  ): Promise<Record<string, any>> {
    const response = await api.get(
      `/remote/servers/${serverId}/bots/${botId}/stats`
    );
    return response.data;
  }
}; 