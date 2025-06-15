import { API_ENDPOINTS } from './config';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Bots API
  public async getBots() {
    return this.request(API_ENDPOINTS.BOTS);
  }

  public async createBot(data: any) {
    return this.request(API_ENDPOINTS.BOTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateBot(id: string, data: any) {
    return this.request(`${API_ENDPOINTS.BOTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteBot(id: string) {
    return this.request(`${API_ENDPOINTS.BOTS}/${id}`, {
      method: 'DELETE',
    });
  }

  // Backtest API
  public async startBacktest(data: any) {
    return this.request(API_ENDPOINTS.BACKTEST, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getBacktestResults(id: string) {
    return this.request(`${API_ENDPOINTS.BACKTEST}/${id}`);
  }

  // Optimizer API
  public async startOptimization(data: any) {
    return this.request(API_ENDPOINTS.OPTIMIZER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getOptimizationResults(id: string) {
    return this.request(`${API_ENDPOINTS.OPTIMIZER}/${id}`);
  }

  public async stopOptimization(id: string) {
    return this.request(`${API_ENDPOINTS.OPTIMIZER}/${id}/stop`, {
      method: 'POST',
    });
  }

  // Monitor API
  public async startMonitoring(data: any) {
    return this.request(API_ENDPOINTS.MONITOR, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async stopMonitoring(id: string) {
    return this.request(`${API_ENDPOINTS.MONITOR}/${id}/stop`, {
      method: 'POST',
    });
  }

  public async getMonitoringStatus(id: string) {
    return this.request(`${API_ENDPOINTS.MONITOR}/${id}`);
  }
}

export const apiClient = new ApiClient(); 