import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface BotStatus {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  status: 'running' | 'stopped' | 'error';
  pnl: number;
  pnlPercentage: number;
  openPositions: number;
  lastUpdate: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface DashboardProps {
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalPnlPercentage, setTotalPnlPercentage] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API calls
      const [botsResponse, marketResponse] = await Promise.all([
        fetch('/api/bots/status'),
        fetch('/api/market/overview'),
      ]);

      if (!botsResponse.ok || !marketResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const botsData = await botsResponse.json();
      const marketData = await marketResponse.json();

      setBots(botsData);
      setMarketData(marketData);

      // Calculate total PnL
      const total = botsData.reduce((sum: number, bot: BotStatus) => sum + bot.pnl, 0);
      const totalPercentage = botsData.reduce((sum: number, bot: BotStatus) => sum + bot.pnlPercentage, 0) / botsData.length;

      setTotalPnl(total);
      setTotalPnlPercentage(totalPercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws/dashboard');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'bot_update') {
        setBots(prevBots => 
          prevBots.map(bot => 
            bot.id === data.bot.id ? { ...bot, ...data.bot } : bot
          )
        );
      } else if (data.type === 'market_update') {
        setMarketData(prevData =>
          prevData.map(item =>
            item.symbol === data.market.symbol ? { ...item, ...data.market } : item
          )
        );
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getStatusColor = (status: BotStatus['status']) => {
    switch (status) {
      case 'running':
        return 'success.main';
      case 'stopped':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status: BotStatus['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon color="success" />;
      case 'stopped':
        return <WarningIcon color="warning" />;
      case 'error':
        return <WarningIcon color="error" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Total PnL Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total PnL
              </Typography>
              <Typography
                variant="h4"
                color={totalPnl >= 0 ? 'success.main' : 'error.main'}
              >
                ${totalPnl.toFixed(2)}
              </Typography>
              <Typography
                variant="subtitle1"
                color={totalPnlPercentage >= 0 ? 'success.main' : 'error.main'}
              >
                {totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Bots Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Bots
              </Typography>
              <Typography variant="h4">
                {bots.filter(bot => bot.status === 'running').length}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                of {bots.length} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Open Positions Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Open Positions
              </Typography>
              <Typography variant="h4">
                {bots.reduce((sum, bot) => sum + bot.openPositions, 0)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                across all bots
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bot Status Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bot Status
            </Typography>
            <Grid container spacing={2}>
              {bots.map((bot) => (
                <Grid item xs={12} sm={6} md={4} key={bot.id}>
                  <Card>
                    <CardHeader
                      avatar={getStatusIcon(bot.status)}
                      title={bot.name}
                      subheader={`${bot.exchange} - ${bot.symbol}`}
                    />
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={getStatusColor(bot.status)}
                        >
                          {bot.status}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          PnL:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={bot.pnl >= 0 ? 'success.main' : 'error.main'}
                        >
                          ${bot.pnl.toFixed(2)} ({bot.pnlPercentage.toFixed(2)}%)
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Open Positions:
                        </Typography>
                        <Typography variant="body2">
                          {bot.openPositions}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Overview
            </Typography>
            <Grid container spacing={2}>
              {marketData.map((market) => (
                <Grid item xs={12} sm={6} md={4} key={market.symbol}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {market.symbol}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Price:
                        </Typography>
                        <Typography variant="body2">
                          ${market.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          24h Change:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={market.change24h >= 0 ? 'success.main' : 'error.main'}
                        >
                          {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          24h Volume:
                        </Typography>
                        <Typography variant="body2">
                          ${market.volume24h.toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 