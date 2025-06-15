import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Assessment,
  AttachMoney
} from '@mui/icons-material';

interface TradingStatsProps {
  equityCurve: { timestamp: string; equity: number }[];
  trades: {
    timestamp: string;
    profit: number;
    side: 'long' | 'short';
  }[];
  stats: {
    totalTrades: number;
    winRate: number;
    averageProfit: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    expectancy: number;
  };
}

export const TradingStats: React.FC<TradingStatsProps> = ({
  equityCurve,
  trades,
  stats
}) => {
  const theme = useTheme();

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: 1,
              p: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  // Prepare data for profit distribution chart
  const profitDistribution = trades.reduce((acc, trade) => {
    const range = Math.floor(trade.profit / 100) * 100;
    const key = `${range}-${range + 100}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profitDistributionData = Object.entries(profitDistribution).map(
    ([range, count]) => ({
      range,
      count
    })
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Total Profit"
            value={formatNumber(
              equityCurve[equityCurve.length - 1].equity -
                equityCurve[0].equity
            )}
            icon={<AttachMoney />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Win Rate"
            value={formatPercentage(stats.winRate)}
            icon={<TrendingUp />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Max Drawdown"
            value={formatPercentage(stats.maxDrawdown)}
            icon={<TrendingDown />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Sharpe Ratio"
            value={stats.sharpeRatio.toFixed(2)}
            icon={<Assessment />}
            color={theme.palette.primary.main}
          />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equity Curve
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis
                      tickFormatter={(value) => formatNumber(value)}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(value: number) => formatNumber(value)}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke={theme.palette.primary.main}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profit Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      name="Number of Trades"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Trades
                  </Typography>
                  <Typography variant="h6">{stats.totalTrades}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Profit
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(stats.averageProfit)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profit Factor
                  </Typography>
                  <Typography variant="h6">
                    {stats.profitFactor.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Expectancy
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(stats.expectancy)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 