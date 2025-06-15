import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
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

interface BacktestConfig {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  strategy: string;
  parameters: {
    [key: string]: any;
  };
}

interface BacktestResult {
  id: string;
  configId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  finalBalance: number;
  equity: number[];
  drawdown: number[];
  trades: Array<{
    timestamp: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl: number;
  }>;
}

interface BacktestManagerProps {
  configs: BacktestConfig[];
  results: BacktestResult[];
  onRunBacktest: (config: BacktestConfig) => Promise<void>;
  onStopBacktest: (id: string) => Promise<void>;
  onSaveConfig: (config: BacktestConfig) => Promise<void>;
  onExportResults: (id: string) => Promise<void>;
}

const BacktestManager: React.FC<BacktestManagerProps> = ({
  configs,
  results,
  onRunBacktest,
  onStopBacktest,
  onSaveConfig,
  onExportResults,
}) => {
  const [selectedConfig, setSelectedConfig] = useState<BacktestConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRunBacktest = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onRunBacktest(selectedConfig);
      setSuccess('Backtest started successfully');
    } catch (err) {
      setError('Failed to start backtest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopBacktest = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onStopBacktest(id);
      setSuccess('Backtest stopped successfully');
    } catch (err) {
      setError('Failed to stop backtest');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onSaveConfig(selectedConfig);
      setSuccess('Configuration saved successfully');
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onExportResults(id);
      setSuccess('Results exported successfully');
    } catch (err) {
      setError('Failed to export results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getChartData = (result: BacktestResult) => {
    return {
      labels: result.equity.map((_, index) => index),
      datasets: [
        {
          label: 'Equity',
          data: result.equity,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Drawdown',
          data: result.drawdown,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Backtest Results',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Backtest Manager</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveConfig}
            disabled={loading || !selectedConfig}
          >
            Save Config
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleRunBacktest}
            disabled={loading || !selectedConfig}
          >
            Run Backtest
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedConfig?.name || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({ ...prev!, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Exchange</InputLabel>
                  <Select
                    value={selectedConfig?.exchange || ''}
                    label="Exchange"
                    onChange={(e) =>
                      setSelectedConfig((prev) => ({ ...prev!, exchange: e.target.value }))
                    }
                  >
                    <MenuItem value="binance">Binance</MenuItem>
                    <MenuItem value="bybit">Bybit</MenuItem>
                    <MenuItem value="okx">OKX</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Symbol"
                  value={selectedConfig?.symbol || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({ ...prev!, symbol: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={selectedConfig?.timeframe || ''}
                    label="Timeframe"
                    onChange={(e) =>
                      setSelectedConfig((prev) => ({ ...prev!, timeframe: e.target.value }))
                    }
                  >
                    <MenuItem value="1m">1 minute</MenuItem>
                    <MenuItem value="5m">5 minutes</MenuItem>
                    <MenuItem value="15m">15 minutes</MenuItem>
                    <MenuItem value="1h">1 hour</MenuItem>
                    <MenuItem value="4h">4 hours</MenuItem>
                    <MenuItem value="1d">1 day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Balance"
                  value={selectedConfig?.initialBalance || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({
                      ...prev!,
                      initialBalance: parseFloat(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={selectedConfig?.startDate || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({ ...prev!, startDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={selectedConfig?.endDate || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({ ...prev!, endDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Trades</TableCell>
                    <TableCell align="right">Win Rate</TableCell>
                    <TableCell align="right">Profit Factor</TableCell>
                    <TableCell align="right">Sharpe Ratio</TableCell>
                    <TableCell align="right">Max Drawdown</TableCell>
                    <TableCell align="right">Final Balance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.id}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.status}
                          color={
                            result.status === 'completed'
                              ? 'success'
                              : result.status === 'running'
                              ? 'primary'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{result.totalTrades}</TableCell>
                      <TableCell align="right">{formatNumber(result.winRate)}%</TableCell>
                      <TableCell align="right">{formatNumber(result.profitFactor)}</TableCell>
                      <TableCell align="right">{formatNumber(result.sharpeRatio)}</TableCell>
                      <TableCell align="right">{formatNumber(result.maxDrawdown)}%</TableCell>
                      <TableCell align="right">${formatNumber(result.finalBalance)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {result.status === 'running' ? (
                            <Tooltip title="Stop">
                              <IconButton
                                size="small"
                                onClick={() => handleStopBacktest(result.id)}
                                color="error"
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Export">
                              <IconButton
                                size="small"
                                onClick={() => handleExportResults(result.id)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {results.map((result) => (
          <Grid item xs={12} key={result.id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Backtest Results: {result.id}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Line data={getChartData(result)} options={chartOptions} />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">PnL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(trade.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={trade.type}
                              color={trade.type === 'buy' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">${formatNumber(trade.price)}</TableCell>
                          <TableCell align="right">{formatNumber(trade.quantity)}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: trade.pnl >= 0 ? 'success.main' : 'error.main' }}
                          >
                            ${formatNumber(trade.pnl)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BacktestManager; 