import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PerformanceChart from './PerformanceChart';

interface BotDetailsProps {
  bot: {
    id: string;
    name: string;
    exchange: string;
    symbol: string;
    strategy: string;
    status: 'running' | 'stopped' | 'error';
    uptime: string;
    profitLoss: number;
    trades: number;
    winRate: number;
    lastUpdate: string;
    performance?: {
      daily: number;
      weekly: number;
      monthly: number;
      yearly: number;
    };
    metrics?: {
      totalVolume: number;
      averageTrade: number;
      maxDrawdown: number;
      sharpeRatio: number;
    };
    chartData?: {
      time: string;
      value: number;
    }[];
  };
}

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor:
    status === 'running'
      ? theme.palette.success.main
      : status === 'stopped'
      ? theme.palette.warning.main
      : theme.palette.error.main,
  color: theme.palette.common.white,
}));

const BotDetails: React.FC<BotDetailsProps> = ({ bot }) => {
  const performance = bot.performance || {
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  };

  const metrics = bot.metrics || {
    totalVolume: 0,
    averageTrade: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
  };

  const chartData = bot.chartData || [];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  {bot.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {bot.exchange} • {bot.symbol} • {bot.strategy}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                <StatusChip
                  label={
                    bot.status === 'running'
                      ? 'Работает'
                      : bot.status === 'stopped'
                      ? 'Остановлен'
                      : 'Ошибка'
                  }
                  status={bot.status}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Аптайм: {bot.uptime}
                </Typography>
                <Typography variant="body2">
                  Последнее обновление: {bot.lastUpdate}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Метрики производительности */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Производительность
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MetricCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Дневная
                  </Typography>
                  <Typography
                    variant="h6"
                    color={performance.daily > 0 ? 'success.main' : 'error.main'}
                  >
                    {performance.daily > 0 ? '+' : ''}
                    {performance.daily}%
                  </Typography>
                </MetricCard>
              </Grid>
              <Grid item xs={6}>
                <MetricCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Недельная
                  </Typography>
                  <Typography
                    variant="h6"
                    color={performance.weekly > 0 ? 'success.main' : 'error.main'}
                  >
                    {performance.weekly > 0 ? '+' : ''}
                    {performance.weekly}%
                  </Typography>
                </MetricCard>
              </Grid>
              <Grid item xs={6}>
                <MetricCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Месячная
                  </Typography>
                  <Typography
                    variant="h6"
                    color={performance.monthly > 0 ? 'success.main' : 'error.main'}
                  >
                    {performance.monthly > 0 ? '+' : ''}
                    {performance.monthly}%
                  </Typography>
                </MetricCard>
              </Grid>
              <Grid item xs={6}>
                <MetricCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Годовая
                  </Typography>
                  <Typography
                    variant="h6"
                    color={performance.yearly > 0 ? 'success.main' : 'error.main'}
                  >
                    {performance.yearly > 0 ? '+' : ''}
                    {performance.yearly}%
                  </Typography>
                </MetricCard>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Торговые метрики */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Торговые метрики
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <MoneyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Общий объем"
                  secondary={`$${metrics.totalVolume.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Средний размер сделки"
                  secondary={`$${metrics.averageTrade.toLocaleString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingDownIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Максимальная просадка"
                  secondary={`${metrics.maxDrawdown}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Коэффициент Шарпа"
                  secondary={metrics.sharpeRatio.toFixed(2)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* График производительности */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              График производительности
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 400 }}>
              {chartData.length > 0 ? (
                <PerformanceChart data={chartData} />
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Нет данных для отображения
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotDetails; 