import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PerformanceChart from '../bots/PerformanceChart';

interface BotMetricsProps {
  bot: {
    id: string;
    name: string;
    status: 'running' | 'stopped' | 'error';
    exchange: string;
    symbol: string;
    strategy: string;
    metrics: {
      profitLoss: number;
      trades: number;
      winRate: number;
      maxDrawdown: number;
      openPositions: number;
      totalBalance: number;
      lastUpdate: string;
    };
    chartData: {
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

const StatusChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
}));

const BotMetrics: React.FC<BotMetricsProps> = ({ bot }) => {
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

  return (
    <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
      <StatusChip
        label={bot.status}
        color={getStatusColor(bot.status)}
        size="small"
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {bot.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bot.strategy} • {bot.exchange} • {bot.symbol}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Update: {new Date(bot.metrics.lastUpdate).toLocaleString()}
          </Typography>
        </Grid>

        {/* Metrics */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Profit/Loss
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    bot.metrics.profitLoss > 0
                      ? 'success.main'
                      : 'error.main'
                  }
                >
                  {bot.metrics.profitLoss > 0 ? '+' : ''}
                  {bot.metrics.profitLoss.toFixed(2)}%
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Trades
                </Typography>
                <Typography variant="h6">
                  {bot.metrics.trades}
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Win Rate
                </Typography>
                <Typography variant="h6">
                  {bot.metrics.winRate.toFixed(2)}%
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Max Drawdown
                </Typography>
                <Typography variant="h6" color="error.main">
                  {bot.metrics.maxDrawdown.toFixed(2)}%
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Open Positions
                </Typography>
                <Typography variant="h6">
                  {bot.metrics.openPositions}
                </Typography>
              </MetricCard>
            </Grid>
            <Grid item xs={6}>
              <MetricCard>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Balance
                </Typography>
                <Typography variant="h6">
                  ${bot.metrics.totalBalance.toLocaleString()}
                </Typography>
              </MetricCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <PerformanceChart data={bot.chartData} height={300} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BotMetrics; 