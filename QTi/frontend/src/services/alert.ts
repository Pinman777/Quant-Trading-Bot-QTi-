import { api } from './api';

export interface Alert {
    id: string;
    type: 'position_limit' | 'balance' | 'order' | 'system';
    exchange: string;
    symbol: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    created_at: string;
    read: boolean;
}

export interface AlertSettings {
    position_limit_threshold: number; // Процент от баланса
    enabled_exchanges: string[];
    enabled_symbols: string[];
    notification_channels: {
        email: boolean;
        telegram: boolean;
        web: boolean;
    };
}

class AlertService {
    async getAlerts(): Promise<Alert[]> {
        const response = await api.get('/alerts');
        return response.data;
    }

    async getUnreadAlerts(): Promise<Alert[]> {
        const response = await api.get('/alerts/unread');
        return response.data;
    }

    async markAlertAsRead(alertId: string): Promise<void> {
        await api.post(`/alerts/${alertId}/read`);
    }

    async markAllAlertsAsRead(): Promise<void> {
        await api.post('/alerts/read-all');
    }

    async getAlertSettings(): Promise<AlertSettings> {
        const response = await api.get('/alerts/settings');
        return response.data;
    }

    async updateAlertSettings(settings: Partial<AlertSettings>): Promise<AlertSettings> {
        const response = await api.put('/alerts/settings', settings);
        return response.data;
    }

    async deleteAlert(alertId: string): Promise<void> {
        await api.delete(`/alerts/${alertId}`);
    }

    async clearAllAlerts(): Promise<void> {
        await api.delete('/alerts');
    }
}

export const alertService = new AlertService(); 