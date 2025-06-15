import React, { useState } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import BotConfigManager from '../components/config/BotConfigManager';

interface BotConfig {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  parameters: {
    [key: string]: any;
  };
  riskManagement: {
    maxPositionSize: number;
    maxDrawdown: number;
    stopLoss: number;
    takeProfit: number;
    trailingStop: boolean;
    trailingStopDistance: number;
  };
  tradingSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    daysOfWeek: number[];
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    events: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const ConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = async (config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to add configuration');
      }

      setSuccess('Configuration added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, config: Partial<BotConfig>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual API call
      const response = await fetch(`/api/configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      setSuccess('Configuration updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual API call
      const response = await fetch(`/api/configs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      setSuccess('Configuration deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual API call
      const response = await fetch(`/api/configs/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate configuration');
      }

      setSuccess('Configuration duplicated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/configs/refresh');
      if (!response.ok) {
        throw new Error('Failed to refresh configurations');
      }

      setSuccess('Configurations refreshed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh configurations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bot Configurations
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <BotConfigManager
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onRefresh={handleRefresh}
          loading={loading}
          error={error}
        />
      </Box>
    </Container>
  );
};

export default ConfigPage; 