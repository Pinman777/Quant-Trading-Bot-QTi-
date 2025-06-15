import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BotTrade } from '../types/bot';

interface TradingAnalyticsProps {
  trades: BotTrade[];
}

const COLORS = ['#4CAF50', '#F44336', '#2196F3', '#FFC107'];

const TradingAnalytics: React.FC<TradingAnalyticsProps> = ({ trades }) => {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate basic statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.profit > 0).length;
  const losingTrades = trades.filter(t => t.profit < 0).length;
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const winRate = (winningTrades / totalTrades) * 100;
  const averageProfit = totalProfit / totalTrades;
  const maxDrawdown = calculateMaxDrawdown(trades);
  const profitFactor = calculateProfitFactor(trades);
  const expectancy = calculateExpectancy(trades);

  // Prepare data for charts
  const monthlyData = prepareMonthlyData(trades);
  const tradeDistribution = prepareTradeDistribution(trades);
  const profitDistribution = prepareProfitDistribution(trades);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Profit
                  </Typography>
                  <Typography
                    variant="h6"
                    color={totalProfit >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatNumber(totalProfit)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">{formatPercentage(winRate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profit Factor
                  </Typography>
                  <Typography variant="h6">{profitFactor.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Drawdown
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatPercentage(maxDrawdown)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Performance */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Legend />
                    <Bar
                      dataKey="profit"
                      name="Profit"
                      fill="#4CAF50"
                    />
                    <Bar
                      dataKey="trades"
                      name="Trades"
                      fill="#2196F3"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trade Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trade Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tradeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {tradeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Statistics
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Trades</TableCell>
                      <TableCell align="right">{totalTrades}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Winning Trades</TableCell>
                      <TableCell align="right">{winningTrades}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Losing Trades</TableCell>
                      <TableCell align="right">{losingTrades}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Profit per Trade</TableCell>
                      <TableCell align="right">
                        {formatNumber(averageProfit)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expectancy</TableCell>
                      <TableCell align="right">
                        {formatNumber(expectancy)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Largest Win</TableCell>
                      <TableCell align="right">
                        {formatNumber(Math.max(...trades.map(t => t.profit)))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Largest Loss</TableCell>
                      <TableCell align="right">
                        {formatNumber(Math.min(...trades.map(t => t.profit)))}
                      </TableCell>
                    </TableRow>
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

// Helper functions
function calculateMaxDrawdown(trades: BotTrade[]): number {
  let peak = 0;
  let maxDrawdown = 0;
  let currentValue = 0;

  trades.forEach(trade => {
    currentValue += trade.profit;
    if (currentValue > peak) {
      peak = currentValue;
    }
    const drawdown = ((peak - currentValue) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
}

function calculateProfitFactor(trades: BotTrade[]): number {
  const grossProfit = trades
    .filter(t => t.profit > 0)
    .reduce((sum, t) => sum + t.profit, 0);
  const grossLoss = Math.abs(
    trades
      .filter(t => t.profit < 0)
      .reduce((sum, t) => sum + t.profit, 0)
  );

  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
}

function calculateExpectancy(trades: BotTrade[]): number {
  const winRate = trades.filter(t => t.profit > 0).length / trades.length;
  const averageWin = trades
    .filter(t => t.profit > 0)
    .reduce((sum, t) => sum + t.profit, 0) / trades.filter(t => t.profit > 0).length;
  const averageLoss = Math.abs(
    trades
      .filter(t => t.profit < 0)
      .reduce((sum, t) => sum + t.profit, 0) / trades.filter(t => t.profit < 0).length
  );

  return winRate * averageWin - (1 - winRate) * averageLoss;
}

function prepareMonthlyData(trades: BotTrade[]) {
  const monthlyData: { [key: string]: { profit: number; trades: number } } = {};

  trades.forEach(trade => {
    const date = new Date(trade.entryTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { profit: 0, trades: 0 };
    }

    monthlyData[monthKey].profit += trade.profit;
    monthlyData[monthKey].trades += 1;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data
  }));
}

function prepareTradeDistribution(trades: BotTrade[]) {
  const distribution = {
    'Buy Trades': trades.filter(t => t.side === 'buy').length,
    'Sell Trades': trades.filter(t => t.side === 'sell').length
  };

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }));
}

function prepareProfitDistribution(trades: BotTrade[]) {
  const distribution = {
    'Profitable Trades': trades.filter(t => t.profit > 0).length,
    'Losing Trades': trades.filter(t => t.profit < 0).length
  };

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }));
}

export default TradingAnalytics; 