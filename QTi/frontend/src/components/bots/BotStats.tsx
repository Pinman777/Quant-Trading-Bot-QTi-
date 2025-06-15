import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface BotStatsProps {
  botId: string;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

interface PerformanceMetrics {
  equity: number;
  drawdown: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  totalTrades: number;
  openPositions: number;
  dailyPnL: number;
  monthlyPnL: number;
  yearlyPnL: number;
}

interface TradeHistory {
  timestamp: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  pnl: number;
}

const BotStats: React.FC<BotStatsProps> = ({
  botId,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    equity: 10000,
    drawdown: 5.2,
    winRate: 65.5,
    profitFactor: 1.8,
    sharpeRatio: 2.1,
    totalTrades: 150,
    openPositions: 3,
    dailyPnL: 250,
    monthlyPnL: 5000,
    yearlyPnL: 60000,
  });

  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([
    {
      timestamp: '2024-02-20T10:00:00Z',
      price: 50000,
      size: 0.1,
      side: 'buy',
      pnl: 100,
    },
    {
      timestamp: '2024-02-20T11:00:00Z',
      price: 51000,
      size: 0.1,
      side: 'sell',
      pnl: 200,
    },
  ]);

  const [equityHistory, setEquityHistory] = useState<{ timestamp: string; value: number }[]>([
    { timestamp: '2024-02-19', value: 9800 },
    { timestamp: '2024-02-20', value: 10000 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Implement real data fetching
        // const response = await fetch(`/api/bots/${botId}/stats`);
        // const data = await response.json();
        // setMetrics(data.metrics);
        // setTradeHistory(data.tradeHistory);
        // setEquityHistory(data.equityHistory);
      } catch (err) {
        console.error('Failed to fetch bot stats:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [botId]);

  const chartData = {
    labels: equityHistory.map((point) => point.timestamp),
    datasets: [
      {
        label: 'Equity',
        data: equityHistory.map((point) => point.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Equity Curve',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Performance Metrics</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Equity & Drawdown
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4">{formatCurrency(metrics.equity)}</Typography>
              <Typography
                variant="body2"
                color={metrics.drawdown > 10 ? 'error.main' : 'text.secondary'}
              >
                Drawdown: {formatPercentage(metrics.drawdown)}
              </Typography>
            </Box>
            <Box sx={{ height: 200 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">{formatPercentage(metrics.winRate)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profit Factor
                  </Typography>
                  <Typography variant="h6">{metrics.profitFactor.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h6">{metrics.sharpeRatio.toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Trades
                  </Typography>
                  <Typography variant="h6">{metrics.totalTrades}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              P&L Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Daily P&L
                  </Typography>
                  <Typography
                    variant="h6"
                    color={metrics.dailyPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(metrics.dailyPnL)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monthly P&L
                  </Typography>
                  <Typography
                    variant="h6"
                    color={metrics.monthlyPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(metrics.monthlyPnL)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Yearly P&L
                  </Typography>
                  <Typography
                    variant="h6"
                    color={metrics.yearlyPnL >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(metrics.yearlyPnL)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Trades
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Time</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Size</th>
                    <th style={{ textAlign: 'center', padding: '8px' }}>Side</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trade, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>
                        {new Date(trade.timestamp).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>
                        {formatCurrency(trade.price)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{trade.size}</td>
                      <td
                        style={{
                          textAlign: 'center',
                          padding: '8px',
                          color: trade.side === 'buy' ? 'success.main' : 'error.main',
                        }}
                      >
                        {trade.side.toUpperCase()}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          padding: '8px',
                          color: trade.pnl >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {formatCurrency(trade.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotStats; 