import axios from 'axios';
import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  lastSync?: string;
  config?: {
    rclone: {
      remote: string;
      path: string;
    };
  };
}

export interface BotInstance {
  id: string;
  name: string;
  serverId: string;
  status: 'running' | 'stopped' | 'error';
  config: {
    exchange: string;
    symbol: string;
    strategy: string;
    [key: string]: any;
  };
  stats?: {
    pnl: number;
    trades: number;
    lastUpdate: string;
  };
}

export interface SyncStatus {
  status: 'success' | 'error' | 'in_progress';
  message?: string;
  progress?: number;
  lastSync?: string;
}

class PBRemoteService {
  private async request<T>(method: string, url: string, data?: any): Promise<T> {
    try {
      const token = authService.getToken();
      const response = await axios({
        method,
        url: `${API_URL}/api/pbremote${url}`,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to communicate with PBRemote');
      }
      throw error;
    }
  }

  // Server management
  async getServers(): Promise<Server[]> {
    return this.request<Server[]>('GET', '/servers');
  }

  async addServer(server: Omit<Server, 'id' | 'status'>): Promise<Server> {
    return this.request<Server>('POST', '/servers', server);
  }

  async updateServer(id: string, server: Partial<Server>): Promise<Server> {
    return this.request<Server>('PUT', `/servers/${id}`, server);
  }

  async deleteServer(id: string): Promise<void> {
    return this.request<void>('DELETE', `/servers/${id}`);
  }

  async testConnection(server: Omit<Server, 'id' | 'status'>): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('POST', '/servers/test', server);
  }

  // Bot instance management
  async getBotInstances(serverId: string): Promise<BotInstance[]> {
    return this.request<BotInstance[]>('GET', `/servers/${serverId}/bots`);
  }

  async startBot(serverId: string, botId: string): Promise<BotInstance> {
    return this.request<BotInstance>('POST', `/servers/${serverId}/bots/${botId}/start`);
  }

  async stopBot(serverId: string, botId: string): Promise<BotInstance> {
    return this.request<BotInstance>('POST', `/servers/${serverId}/bots/${botId}/stop`);
  }

  async updateBotConfig(serverId: string, botId: string, config: Partial<BotInstance['config']>): Promise<BotInstance> {
    return this.request<BotInstance>('PUT', `/servers/${serverId}/bots/${botId}/config`, config);
  }

  // Sync management
  async syncServer(serverId: string): Promise<SyncStatus> {
    return this.request<SyncStatus>('POST', `/servers/${serverId}/sync`);
  }

  async getSyncStatus(serverId: string): Promise<SyncStatus> {
    return this.request<SyncStatus>('GET', `/servers/${serverId}/sync/status`);
  }

  // Rclone management
  async getRcloneRemotes(): Promise<string[]> {
    return this.request<string[]>('GET', '/rclone/remotes');
  }

  async testRcloneRemote(remote: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('POST', '/rclone/test', { remote });
  }
}

export const pbremoteService = new PBRemoteService(); 