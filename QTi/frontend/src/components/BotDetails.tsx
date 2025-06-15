import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Settings,
  Refresh,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Assessment,
  Error as ErrorIcon,
  CheckCircle,
  Pause
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
  Legend
} from 'chart.js';
import { BotStatus, BotTrade } from '../types/bot';
import { TradingChart } from './TradingChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface BotDetailsProps {
  botId: string;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
  onRefresh: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bot-tabpanel-${index}`}
      aria-labelledby={`bot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BotDetails: React.FC<BotDetailsProps> = ({
  botId,
  onStart,
  onStop,
  onRefresh,
  onEdit
}) => {
  const [bot, setBot] = useState<BotStatus | null>(null);
  const [trades, setTrades] = useState<BotTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchBotDetails();
  }, [botId]);

  const fetchBotDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [botResponse, tradesResponse] = await Promise.all([
        fetch(`/api/bots/${botId}`),
        fetch(`/api/bots/${botId}/trades`)
      ]);

      if (!botResponse.ok || !tradesResponse.ok) {
        throw new Error('Failed to fetch bot details');
      }

      const [botData, tradesData] = await Promise.all([
        botResponse.json(),
        tradesResponse.json()
      ]);

      setBot(botData);
      setTrades(tradesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'start' | 'stop' | 'refresh') => {
    try {
      setActionLoading(true);
      setError(null);

      switch (action) {
        case 'start':
          await onStart(botId);
          break;
        case 'stop':
          await onStop(botId);
          break;
        case 'refresh':
          await onRefresh(botId);
          break;
      }

      await fetchBotDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle />;
      case 'stopped':
        return <ErrorIcon />;
      case 'paused':
        return <Pause />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!bot) {
    return (
      <Alert severity="error">
        Bot not found
      </Alert>
    );
  }

  const equityCurve = trades.map((trade, index) => ({
    time: new Date(trade.entryTime).toLocaleDateString(),
    equity: trade.profit
  }));

  const chartData = {
    labels: equityCurve.map(point => point.time),
    datasets: [
      {
        label: 'Equity Curve',
        data: equityCurve.map(point => point.equity),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Equity Curve'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {bot.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={bot.status}
                  color={getStatusColor(bot.status)}
                  icon={getStatusIcon(bot.status)}
                />
                <Typography variant="body2" color="text.secondary">
                  Last update: {new Date(bot.lastUpdate).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                Exchange: {bot.exchange}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Symbol: {bot.symbol}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Start Bot">
                  <IconButton
                    color="primary"
                    onClick={() => handleAction('start')}
                    disabled={actionLoading || bot.status === 'running'}
                  >
                    <PlayArrow />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Stop Bot">
                  <IconButton
                    color="error"
                    onClick={() => handleAction('stop')}
                    disabled={actionLoading || bot.status === 'stopped'}
                  >
                    <Stop />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton
                    color="default"
                    onClick={() => handleAction('refresh')}
                    disabled={actionLoading}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Profit
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(bot.profit)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">
                    {formatPercentage(bot.winRate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Trades
                  </Typography>
                  <Typography variant="h6">
                    {bot.trades}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Last Price
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(bot.lastPrice)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equity Curve
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Trades
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Side</TableCell>
                      <TableCell>Entry Price</TableCell>
                      <TableCell>Exit Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Profit</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          {new Date(trade.entryTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trade.side}
                            color={trade.side === 'buy' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatNumber(trade.entryPrice)}</TableCell>
                        <TableCell>{formatNumber(trade.exitPrice)}</TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell
                          sx={{
                            color: trade.profit >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          {formatNumber(trade.profit)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trade.status}
                            color={
                              trade.status === 'closed'
                                ? 'success'
                                : trade.status === 'open'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotDetails; 