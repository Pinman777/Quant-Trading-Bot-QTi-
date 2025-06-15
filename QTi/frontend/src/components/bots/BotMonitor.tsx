import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import CandlestickChart from '../charts/CandlestickChart';

interface BotMetrics {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  currentPrice: number;
  position: {
    size: number;
    entryPrice: number;
    currentPnL: number;
    unrealizedPnL: number;
  };
  performance: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  orders: {
    open: number;
    filled: number;
    cancelled: number;
  };
  lastUpdate: string;
}

interface BotMonitorProps {
  botId: string;
  metrics: BotMetrics;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
  onRefresh: (id: string) => Promise<void>;
  onSettings: (id: string) => void;
  loading?: boolean;
  error?: string;
}

const BotMonitor: React.FC<BotMonitorProps> = ({
  botId,
  metrics,
  onStart,
  onStop,
  onRefresh,
  onSettings,
  loading = false,
  error,
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        onRefresh(botId);
      }, 5000); // Обновление каждые 5 секунд
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, botId, onRefresh]);

  const handleStart = async () => {
    try {
      await onStart(botId);
    } catch (err) {
      console.error('Failed to start bot:', err);
    }
  };

  const handleStop = async () => {
    try {
      await onStop(botId);
    } catch (err) {
      console.error('Failed to stop bot:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      await onRefresh(botId);
    } catch (err) {
      console.error('Failed to refresh metrics:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <SuccessIcon />;
      case 'stopped':
        return <StopIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            {metrics.name}
          </Typography>
          <Chip
            icon={getStatusIcon(metrics.status)}
            label={metrics.status.toUpperCase()}
            color={getStatusColor(metrics.status)}
            size="small"
          />
        </Box>
        <Box>
          <Tooltip title={metrics.status === 'running' ? 'Stop Bot' : 'Start Bot'}>
            <IconButton
              onClick={metrics.status === 'running' ? handleStop : handleStart}
              disabled={loading}
              color={metrics.status === 'running' ? 'error' : 'success'}
              sx={{ mr: 1 }}
            >
              {metrics.status === 'running' ? <StopIcon /> : <StartIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => onSettings(botId)} disabled={loading}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Position
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Size
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(metrics.position.size)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Entry Price
                  </Typography>
                  <Typography variant="h6">
                    ${formatNumber(metrics.position.entryPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current PnL
                  </Typography>
                  <Typography
                    variant="h6"
                    color={metrics.position.currentPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    ${formatNumber(metrics.position.currentPnL)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Unrealized PnL
                  </Typography>
                  <Typography
                    variant="h6"
                    color={metrics.position.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    ${formatNumber(metrics.position.unrealizedPnL)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Trades
                  </Typography>
                  <Typography variant="h6">
                    {metrics.performance.totalTrades}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(metrics.performance.winRate)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Profit Factor
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(metrics.performance.profitFactor)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(metrics.performance.sharpeRatio)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Open Orders
                  </Typography>
                  <Typography variant="h6">
                    {metrics.orders.open}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Filled Orders
                  </Typography>
                  <Typography variant="h6">
                    {metrics.orders.filled}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled Orders
                  </Typography>
                  <Typography variant="h6">
                    {metrics.orders.cancelled}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                System Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="h6">
                    {formatUptime(metrics.uptime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h6">
                    ${formatNumber(metrics.currentPrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Update
                  </Typography>
                  <Typography variant="body1">
                    {new Date(metrics.lastUpdate).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BotMonitor; 