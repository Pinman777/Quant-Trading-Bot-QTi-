import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { createChart, ColorType } from 'lightweight-charts';
import { useRouter } from 'next/router';

interface Bot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  exchange: string;
  symbol: string;
  strategy: string;
  pnl: number;
  pnlPercent: number;
  openPositions: number;
  totalTrades: number;
  winRate: number;
  lastUpdate: string;
  error?: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface DashboardProps {
  userId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (chartContainer && selectedBot) {
      const chart = createChart(chartContainer, {
        layout: {
          background: { type: ColorType.Solid, color: theme.palette.background.paper },
          textColor: theme.palette.text.primary,
        },
        grid: {
          vertLines: { color: theme.palette.divider },
          horzLines: { color: theme.palette.divider },
        },
        width: chartContainer.clientWidth,
        height: 300,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: theme.palette.success.main,
        downColor: theme.palette.error.main,
        borderVisible: false,
        wickUpColor: theme.palette.success.main,
        wickDownColor: theme.palette.error.main,
      });

      // Здесь будет загрузка данных для графика
      // candlestickSeries.setData(data);

      const handleResize = () => {
        chart.applyOptions({ width: chartContainer.clientWidth });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [chartContainer, selectedBot, theme]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [botsResponse, marketDataResponse] = await Promise.all([
        fetch(`/api/users/${userId}/bots`),
        fetch('/api/market-data')
      ]);

      if (!botsResponse.ok || !marketDataResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [botsData, marketData] = await Promise.all([
        botsResponse.json(),
        marketDataResponse.json()
      ]);

      setBots(botsData);
      setMarketData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBotAction = async (botId: string, action: 'start' | 'stop') => {
    try {
      setError(null);

      const response = await fetch(`/api/bots/${botId}/${action}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} bot`);
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading && !bots.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Статистика */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Overview</Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={fetchData}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {bots.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Bots
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {bots.filter(bot => bot.status === 'running').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Running
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {bots.filter(bot => bot.status === 'error').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Errors
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {bots.filter(bot => bot.status === 'stopped').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stopped
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Список ботов */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Bots
              </Typography>
              <Grid container spacing={2}>
                {bots.map((bot) => (
                  <Grid item xs={12} key={bot.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{bot.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {bot.exchange} - {bot.symbol}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={bot.status}
                              color={
                                bot.status === 'running'
                                  ? 'success'
                                  : bot.status === 'error'
                                  ? 'error'
                                  : 'warning'
                              }
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleBotAction(bot.id, bot.status === 'running' ? 'stop' : 'start')}
                            >
                              {bot.status === 'running' ? <StopIcon /> : <PlayIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/bots/${bot.id}`)}
                            >
                              <SettingsIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              PnL
                            </Typography>
                            <Typography
                              variant="body1"
                              color={bot.pnl >= 0 ? 'success.main' : 'error.main'}
                            >
                              {bot.pnl.toFixed(2)} ({bot.pnlPercent.toFixed(2)}%)
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Open Positions
                            </Typography>
                            <Typography variant="body1">
                              {bot.openPositions}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Total Trades
                            </Typography>
                            <Typography variant="body1">
                              {bot.totalTrades}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Win Rate
                            </Typography>
                            <Typography variant="body1">
                              {bot.winRate.toFixed(2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* График и детали */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              {selectedBot ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {selectedBot.name} - {selectedBot.symbol}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        size="small"
                        label={selectedBot.status}
                        color={
                          selectedBot.status === 'running' ? 'success' :
                          selectedBot.status === 'error' ? 'error' :
                          'default'
                        }
                      />
                      <Chip
                        size="small"
                        label={selectedBot.exchange}
                      />
                    </Box>
                  </Box>
                  <Box
                    ref={setChartContainer}
                    sx={{
                      height: 300,
                      width: '100%',
                      mb: 2
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Strategy
                      </Typography>
                      <Typography variant="body1">
                        {selectedBot.strategy}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Last Update
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedBot.lastUpdate).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 300
                  }}
                >
                  <Typography color="textSecondary">
                    Select a bot to view details
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Рыночные данные */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Overview
              </Typography>
              <Grid container spacing={2}>
                {marketData.map((data) => (
                  <Grid item xs={12} sm={6} md={3} key={data.symbol}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{data.symbol}</Typography>
                        <Typography
                          variant="h5"
                          color={data.change24h >= 0 ? 'success.main' : 'error.main'}
                        >
                          ${data.price.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={data.change24h >= 0 ? 'success.main' : 'error.main'}
                        >
                          {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          24h Volume: ${data.volume24h.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
export default Dashboard; 