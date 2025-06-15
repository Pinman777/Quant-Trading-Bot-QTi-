import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Assessment,
  Info
} from '@mui/icons-material';
import { BotStats as BotStatsType } from '../types/bot';
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
  stats: BotStatsType;
  equityCurve?: { timestamp: string; equity: number }[];
}

export const BotStats: React.FC<BotStatsProps> = ({ stats, equityCurve }) => {
  const theme = useTheme();

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const chartData = {
    labels: equityCurve?.map(point => new Date(point.timestamp).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Equity Curve',
        data: equityCurve?.map(point => point.equity) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `Equity: ${formatNumber(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          callback: (value: number) => formatNumber(value)
        }
      }
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    tooltip?: string;
    color?: string;
  }> = ({ title, value, icon, tooltip, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ color: color || 'inherit', mr: 1 }}>{icon}</Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small">
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography variant="h4" component="div" sx={{ color: color || 'inherit' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Profit"
            value={formatNumber(stats.totalProfit)}
            icon={<TrendingUp />}
            color={stats.totalProfit >= 0 ? theme.palette.success.main : theme.palette.error.main}
            tooltip="Total profit/loss across all bots"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Win Rate"
            value={formatPercentage(stats.winRate)}
            icon={<Assessment />}
            tooltip="Percentage of profitable trades"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Max Drawdown"
            value={formatPercentage(stats.maxDrawdown)}
            icon={<TrendingDown />}
            color={theme.palette.error.main}
            tooltip="Maximum observed loss from peak to trough"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Sharpe Ratio"
            value={stats.sharpeRatio.toFixed(2)}
            icon={<Timeline />}
            tooltip="Risk-adjusted return metric"
          />
        </Grid>
      </Grid>

      {equityCurve && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShowChart sx={{ mr: 1 }} />
              <Typography variant="h6">Equity Curve</Typography>
            </Box>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Bots"
            value={stats.totalBots}
            icon={<Assessment />}
            tooltip="Total number of configured bots"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Bots"
            value={stats.activeBots}
            icon={<TrendingUp />}
            tooltip="Number of currently running bots"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Trades"
            value={stats.totalTrades}
            icon={<Timeline />}
            tooltip="Total number of executed trades"
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 