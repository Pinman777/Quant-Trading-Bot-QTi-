import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { createChart, ColorType } from 'lightweight-charts';

interface BacktestResult {
  id: string;
  config: {
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
  };
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    finalBalance: number;
    totalReturn: number;
    annualizedReturn: number;
  };
  trades: {
    timestamp: string;
    type: 'buy' | 'sell';
    price: number;
    size: number;
    pnl: number;
  }[];
  equity: {
    timestamp: string;
    value: number;
  }[];
  createdAt: string;
}

interface BacktestManagerProps {
  onStart?: (config: Omit<BacktestResult['config'], 'id'>) => Promise<void>;
  onStop?: () => Promise<void>;
  onSave?: (result: BacktestResult) => Promise<void>;
  onDownload?: (result: BacktestResult) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const BacktestManager: React.FC<BacktestManagerProps> = ({
  onStart,
  onStop,
  onSave,
  onDownload,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<any>(null);
  const [newConfig, setNewConfig] = useState<Omit<BacktestResult['config'], 'id'>>({
    exchange: 'binance',
    symbol: '',
    timeframe: '1h',
    startDate: '',
    endDate: '',
    initialBalance: 10000,
    strategy: 'grid',
    parameters: {},
  });

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (chartContainer) {
      const newChart = createChart(chartContainer, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        width: chartContainer.clientWidth,
        height: 400,
      });

      setChart(newChart);

      return () => {
        newChart.remove();
      };
    }
  }, [chartContainer]);

  useEffect(() => {
    if (chart && selectedResult) {
      const equitySeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });

      equitySeries.setData(
        selectedResult.equity.map((point) => ({
          time: new Date(point.timestamp).getTime() / 1000,
          value: point.value,
        }))
      );

      chart.timeScale().fitContent();
    }
  }, [chart, selectedResult]);

  const fetchResults = async () => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/backtest/results');
      if (!response.ok) {
        throw new Error('Failed to fetch backtest results');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error fetching backtest results:', err);
    }
  };

  const handleStart = async () => {
    if (onStart) {
      await onStart(newConfig);
      setIsSettingsDialogOpen(false);
      fetchResults();
    }
  };

  const handleStop = async () => {
    if (onStop) {
      await onStop();
      fetchResults();
    }
  };

  const handleSave = async () => {
    if (selectedResult && onSave) {
      await onSave(selectedResult);
      fetchResults();
    }
  };

  const handleDownload = async () => {
    if (selectedResult && onDownload) {
      await onDownload(selectedResult);
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
    fetchResults();
  };

  const renderResultCard = (result: BacktestResult) => (
    <Card key={result.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {result.config.symbol} - {result.config.strategy}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={result.config.exchange} size="small" />
              <Chip label={result.config.timeframe} size="small" />
              <Chip
                label={`${new Date(result.config.startDate).toLocaleDateString()} - ${new Date(
                  result.config.endDate
                ).toLocaleDateString()}`}
                size="small"
              />
            </Box>
          </Box>
          <Box>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => handleDownload()}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton size="small" onClick={() => handleSave()}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Performance Metrics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Win Rate: ${(result.performance.winRate * 100).toFixed(2)}%`}
                size="small"
                color={result.performance.winRate > 0.5 ? 'success' : 'default'}
              />
              <Chip
                label={`Profit Factor: ${result.performance.profitFactor.toFixed(2)}`}
                size="small"
                color={result.performance.profitFactor > 1 ? 'success' : 'default'}
              />
              <Chip
                label={`Sharpe Ratio: ${result.performance.sharpeRatio.toFixed(2)}`}
                size="small"
                color={result.performance.sharpeRatio > 1 ? 'success' : 'default'}
              />
              <Chip
                label={`Max Drawdown: ${result.performance.maxDrawdown.toFixed(2)}%`}
                size="small"
                color={result.performance.maxDrawdown < 20 ? 'success' : 'error'}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Returns
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Total Return: ${result.performance.totalReturn.toFixed(2)}%`}
                size="small"
                color={result.performance.totalReturn > 0 ? 'success' : 'error'}
              />
              <Chip
                label={`Annualized: ${result.performance.annualizedReturn.toFixed(2)}%`}
                size="small"
                color={result.performance.annualizedReturn > 0 ? 'success' : 'error'}
              />
              <Chip
                label={`Final Balance: $${result.performance.finalBalance.toFixed(2)}`}
                size="small"
                color={result.performance.finalBalance > result.config.initialBalance ? 'success' : 'error'}
              />
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Created: {new Date(result.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSettingsForm = () => (
    <Box>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
        <Tab label="Basic" />
        <Tab label="Strategy" />
        <Tab label="Optimization" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Exchange</InputLabel>
            <Select
              value={newConfig.exchange}
              label="Exchange"
              onChange={(e) => setNewConfig({ ...newConfig, exchange: e.target.value })}
            >
              <MenuItem value="binance">Binance</MenuItem>
              <MenuItem value="bybit">Bybit</MenuItem>
              <MenuItem value="okx">OKX</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Symbol"
            value={newConfig.symbol}
            onChange={(e) => setNewConfig({ ...newConfig, symbol: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={newConfig.timeframe}
              label="Timeframe"
              onChange={(e) => setNewConfig({ ...newConfig, timeframe: e.target.value })}
            >
              <MenuItem value="1m">1 minute</MenuItem>
              <MenuItem value="5m">5 minutes</MenuItem>
              <MenuItem value="15m">15 minutes</MenuItem>
              <MenuItem value="1h">1 hour</MenuItem>
              <MenuItem value="4h">4 hours</MenuItem>
              <MenuItem value="1d">1 day</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={newConfig.startDate}
            onChange={(e) => setNewConfig({ ...newConfig, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={newConfig.endDate}
            onChange={(e) => setNewConfig({ ...newConfig, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Initial Balance"
            value={newConfig.initialBalance}
            onChange={(e) => setNewConfig({ ...newConfig, initialBalance: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={newConfig.strategy}
              label="Strategy"
              onChange={(e) => setNewConfig({ ...newConfig, strategy: e.target.value })}
            >
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="dca">DCA</MenuItem>
              <MenuItem value="scalping">Scalping</MenuItem>
              <MenuItem value="swing">Swing</MenuItem>
            </Select>
          </FormControl>

          {/* Strategy-specific parameters will be added here */}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <FormControlLabel
            control={<Switch />}
            label="Enable Parameter Optimization"
          />

          {/* Optimization settings will be added here */}
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Backtest Results</Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => setIsSettingsDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            New Backtest
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {selectedResult && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Equity Curve
                  </Typography>
                  <Box
                    ref={setChartContainer}
                    sx={{ width: '100%', height: 400 }}
                  />
                </CardContent>
              </Card>
            )}
          </Grid>
          {results.map(renderResultCard)}
        </Grid>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Backtest Settings</DialogTitle>
        <DialogContent>
          {renderSettingsForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStart} variant="contained" startIcon={<StartIcon />}>
            Start Backtest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BacktestManager; 