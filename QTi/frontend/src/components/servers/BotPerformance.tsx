import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
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

interface BotPerformance {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  pnl: number;
  pnlPercentage: number;
  winRate: number;
  trades: number;
  avgTradeTime: number;
  maxDrawdown: number;
  sharpeRatio: number;
  history: {
    timestamp: string;
    pnl: number;
    equity: number;
  }[];
}

interface BotPerformanceProps {
  bot: BotPerformance;
  onRefresh: (botId: string) => void;
}

const BotPerformance: React.FC<BotPerformanceProps> = ({ bot, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('24h');

  const chartData = {
    labels: bot.history.map((h) => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'PnL',
        data: bot.history.map((h) => h.pnl),
        borderColor: bot.pnl >= 0 ? '#00C4B4' : '#FF5252',
        backgroundColor: bot.pnl >= 0 ? 'rgba(0, 196, 180, 0.1)' : 'rgba(255, 82, 82, 0.1)',
        fill: true,
      },
      {
        label: 'Equity',
        data: bot.history.map((h) => h.equity),
        borderColor: '#1A2B44',
        backgroundColor: 'rgba(26, 43, 68, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {bot.name} ({bot.exchange} - {bot.symbol})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={() => onRefresh(bot.id)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    PnL
                  </Typography>
                  <Typography
                    variant="h6"
                    color={bot.pnl >= 0 ? 'success.main' : 'error.main'}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {bot.pnl >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    {bot.pnl.toFixed(2)} ({bot.pnlPercentage.toFixed(2)}%)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">
                    {bot.winRate.toFixed(2)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={bot.winRate}
                    color={bot.winRate >= 50 ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trades
                  </Typography>
                  <Typography variant="h6">
                    {bot.trades}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg. {bot.avgTradeTime.toFixed(1)} min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Drawdown
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {bot.maxDrawdown.toFixed(2)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h6">
                    {bot.sharpeRatio.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BotPerformance; 