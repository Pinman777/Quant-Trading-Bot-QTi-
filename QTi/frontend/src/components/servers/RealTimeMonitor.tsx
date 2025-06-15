import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface BotMetrics {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  pnl: number;
  winRate: number;
  trades: number;
  equity: number;
  drawdown: number;
  timestamp: string;
}

interface RealTimeMonitorProps {
  botId: string;
  onRefresh: () => void;
  onStart: () => void;
  onStop: () => void;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  botId,
  onRefresh,
  onStart,
  onStop,
}) => {
  const [metrics, setMetrics] = useState<BotMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/bots/${botId}/metrics`);
      const data = await response.json();
      setMetrics((prev) => [...prev, data].slice(-50)); // Keep last 50 data points
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: metrics.map((m) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'PnL',
        data: metrics.map((m) => m.pnl),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Equity',
        data: metrics.map((m) => m.equity),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
    },
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Real-Time Monitor</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}>
            <IconButton
              onClick={() => setAutoRefresh(!autoRefresh)}
              color={autoRefresh ? 'primary' : 'default'}
            >
              <PlayIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchMetrics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color={latestMetrics?.status === 'running' ? 'error' : 'success'}
            startIcon={latestMetrics?.status === 'running' ? <StopIcon /> : <PlayIcon />}
            onClick={latestMetrics?.status === 'running' ? onStop : onStart}
          >
            {latestMetrics?.status === 'running' ? 'Stop Bot' : 'Start Bot'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </Paper>
        </Grid>

        {latestMetrics && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      PnL
                    </Typography>
                    <Typography
                      variant="h6"
                      color={latestMetrics.pnl >= 0 ? 'success.main' : 'error.main'}
                    >
                      {latestMetrics.pnl.toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Win Rate
                    </Typography>
                    <Typography variant="h6">
                      {latestMetrics.winRate.toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trades
                    </Typography>
                    <Typography variant="h6">
                      {latestMetrics.trades}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Drawdown
                    </Typography>
                    <Typography
                      variant="h6"
                      color={latestMetrics.drawdown > 20 ? 'error.main' : 'warning.main'}
                    >
                      {latestMetrics.drawdown.toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {latestMetrics?.status === 'error' && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              icon={<WarningIcon />}
              action={
                <Button color="inherit" size="small" onClick={onStart}>
                  Restart
                </Button>
              }
            >
              Bot is in error state. Please check the logs for details.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RealTimeMonitor; 