import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Compare as CompareIcon,
  Tune as TuneIcon,
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

interface BacktestResult {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: {
    timestamp: string;
    equity: number;
  }[];
  trades: {
    timestamp: string;
    type: 'long' | 'short';
    entryPrice: number;
    exitPrice: number;
    pnl: number;
  }[];
}

interface BacktestResultsProps {
  symbol: string;
  timeframe: string;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({
  symbol,
  timeframe,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BacktestResult | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<number>(10000);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ma_crossover');
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [comparisonResults, setComparisonResults] = useState<any>(null);

  const strategies = [
    { value: 'ma_crossover', label: 'Moving Average Crossover' },
    { value: 'rsi', label: 'RSI Strategy' },
    { value: 'macd', label: 'MACD Strategy' },
    { value: 'bollinger_bands', label: 'Bollinger Bands' },
    { value: 'ichimoku', label: 'Ichimoku Cloud' },
    { value: 'adx', label: 'ADX Strategy' },
  ];

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/backtest/run?symbol=${symbol}&timeframe=${timeframe}&startDate=${startDate}&endDate=${endDate}&initialBalance=${initialBalance}&strategy=${selectedStrategy}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch backtest results');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/backtest/optimize?symbol=${symbol}&timeframe=${timeframe}&startDate=${startDate}&endDate=${endDate}&strategy=${selectedStrategy}`
      );
      if (!response.ok) {
        throw new Error('Failed to optimize strategy');
      }
      const data = await response.json();
      setOptimizationResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const compareStrategies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/backtest/compare?symbol=${symbol}&timeframe=${timeframe}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to compare strategies');
      }
      const data = await response.json();
      setComparisonResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async (format: 'csv' | 'excel') => {
    if (!results) return;

    try {
      const response = await fetch(
        `/api/backtest/export?format=${format}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(results),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to export results');
      }
      const data = await response.json();
      
      // Создаем и скачиваем файл
      const blob = new Blob(
        [format === 'csv' ? data.equity_curve : data.excel_file],
        { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backtest_results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const equityChartData = {
    labels: results?.equityCurve.map((point) => point.timestamp) || [],
    datasets: [
      {
        label: 'Equity Curve',
        data: results?.equityCurve.map((point) => point.equity) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Equity Curve',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Backtest Configuration
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={selectedStrategy}
                label="Strategy"
                onChange={(e) => setSelectedStrategy(e.target.value)}
              >
                {strategies.map((strategy) => (
                  <MenuItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Initial Balance"
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={fetchResults}
                disabled={loading || !startDate || !endDate}
              >
                Run Backtest
              </Button>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={runOptimization}
                disabled={loading || !startDate || !endDate}
              >
                Optimize
              </Button>
              <Button
                variant="outlined"
                startIcon={<CompareIcon />}
                onClick={compareStrategies}
                disabled={loading || !startDate || !endDate}
              >
                Compare Strategies
              </Button>
              <Tooltip title="Export to CSV">
                <IconButton
                  onClick={() => exportResults('csv')}
                  disabled={!results}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Return
                  </Typography>
                  <Typography variant="h6">
                    {((results.finalBalance / results.initialBalance - 1) * 100).toFixed(2)}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Win Rate
                  </Typography>
                  <Typography variant="h6">{results.winRate.toFixed(2)}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Profit Factor
                  </Typography>
                  <Typography variant="h6">{results.profitFactor.toFixed(2)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h6">{results.sharpeRatio.toFixed(2)}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Equity Curve
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line data={equityChartData} options={chartOptions} />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Trade History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Entry Price</TableCell>
                    <TableCell>Exit Price</TableCell>
                    <TableCell>P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.trades.map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>{trade.timestamp}</TableCell>
                      <TableCell>{trade.type}</TableCell>
                      <TableCell>{trade.entryPrice.toFixed(2)}</TableCell>
                      <TableCell>{trade.exitPrice.toFixed(2)}</TableCell>
                      <TableCell
                        sx={{
                          color: trade.pnl >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {trade.pnl.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {optimizationResults && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Optimization Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parameter</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Sharpe Ratio</TableCell>
                  <TableCell>Total Return</TableCell>
                  <TableCell>Max Drawdown</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {optimizationResults.results.map((result: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{JSON.stringify(result.params)}</TableCell>
                    <TableCell>{result.results.sharpeRatio.toFixed(2)}</TableCell>
                    <TableCell>
                      {(result.results.totalReturn * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {result.results.maxDrawdown.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {comparisonResults && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Strategy Comparison
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Sharpe Ratio</TableCell>
                  <TableCell>Total Return</TableCell>
                  <TableCell>Max Drawdown</TableCell>
                  <TableCell>Win Rate</TableCell>
                  <TableCell>Profit Factor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonResults.results.map((result: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{result.strategy}</TableCell>
                    <TableCell>{result.sharpeRatio.toFixed(2)}</TableCell>
                    <TableCell>
                      {(result.totalReturn * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {result.maxDrawdown.toFixed(2)}%
                    </TableCell>
                    <TableCell>{result.winRate.toFixed(2)}%</TableCell>
                    <TableCell>{result.profitFactor.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}; 