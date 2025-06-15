import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import BotMetrics from '../components/monitoring/BotMetrics';
import OpenPositions from '../components/monitoring/OpenPositions';
import RecentTrades from '../components/monitoring/RecentTrades';

// Mock data
const mockBots = [
  {
    id: '1',
    name: 'BTC/USDT Bot',
    status: 'running',
    exchange: 'Binance',
    symbol: 'BTC/USDT',
    strategy: 'RSI Strategy',
    metrics: {
      profitLoss: 1250.50,
      trades: 45,
      winRate: 68.5,
      maxDrawdown: 5.2,
      openPositions: 2,
      totalBalance: 10250.50,
    },
    chartData: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Balance',
          data: Array.from({ length: 30 }, () => Math.random() * 1000 + 9000),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
  },
  {
    id: '2',
    name: 'ETH/USDT Bot',
    status: 'stopped',
    exchange: 'Binance',
    symbol: 'ETH/USDT',
    strategy: 'MACD Strategy',
    metrics: {
      profitLoss: -320.75,
      trades: 28,
      winRate: 45.2,
      maxDrawdown: 8.5,
      openPositions: 0,
      totalBalance: 9679.25,
    },
    chartData: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Balance',
          data: Array.from({ length: 30 }, () => Math.random() * 1000 + 8000),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
  },
];

const mockPositions = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    side: 'long',
    entryPrice: 45000,
    currentPrice: 46500,
    size: 0.1,
    pnl: 150,
    pnlPercentage: 3.33,
    openTime: '2024-02-20T10:30:00Z',
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    side: 'short',
    entryPrice: 2800,
    currentPrice: 2750,
    size: 1.5,
    pnl: 75,
    pnlPercentage: 1.79,
    openTime: '2024-02-20T11:15:00Z',
  },
];

const mockTrades = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    side: 'buy',
    price: 45000,
    size: 0.1,
    total: 4500,
    profit: 150,
    profitPercentage: 3.33,
    timestamp: '2024-02-20T10:30:00Z',
  },
  {
    id: '2',
    symbol: 'ETH/USDT',
    side: 'sell',
    price: 2800,
    size: 1.5,
    total: 4200,
    profit: 75,
    profitPercentage: 1.79,
    timestamp: '2024-02-20T11:15:00Z',
  },
];

const MonitoringPage: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [botData, setBotData] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    if (selectedBot) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const bot = mockBots.find((b) => b.id === selectedBot);
        setBotData(bot);
        setPositions(mockPositions);
        setTrades(mockTrades);
        setLoading(false);
      }, 1000);
    }
  }, [selectedBot]);

  const handleBotChange = (event: SelectChangeEvent) => {
    setSelectedBot(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bot Monitoring
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Bot</InputLabel>
              <Select
                value={selectedBot}
                label="Select Bot"
                onChange={handleBotChange}
              >
                {mockBots.map((bot) => (
                  <MenuItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        botData && (
          <>
            <BotMetrics bot={botData} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <OpenPositions positions={positions} />
              </Grid>
              <Grid item xs={12} md={6}>
                <RecentTrades trades={trades} />
              </Grid>
            </Grid>
          </>
        )
      )}
    </Box>
  );
};

export default MonitoringPage; 