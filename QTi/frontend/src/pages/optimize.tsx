import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StrategyParameters from '../components/backtest/StrategyParameters';
import OptimizationSettings from '../components/optimization/OptimizationSettings';
import OptimizationResults from '../components/optimization/OptimizationResults';
import { Parameter } from '../components/backtest/StrategyParameters';

const strategies = [
  'Grid Trading',
  'DCA',
  'RSI',
  'MACD',
  'Bollinger Bands',
];

const exchanges = ['Binance', 'Bybit', 'OKX'];

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

const OptimizePage: React.FC = () => {
  const [formData, setFormData] = useState({
    strategy: '',
    exchange: '',
    symbol: '',
    timeframe: '',
    startDate: new Date(),
    endDate: new Date(),
    initialBalance: 1000,
  });

  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStrategyChange = (strategy: string) => {
    handleInputChange('strategy', strategy);
    // Reset parameters when strategy changes
    setParameters([]);
  };

  const handleParameterChange = (name: string, value: any) => {
    setParameters((prev) => {
      const existing = prev.find((p) => p.name === name);
      if (existing) {
        return prev.map((p) =>
          p.name === name ? { ...p, value } : p
        );
      }
      // Get the parameter definition from StrategyParameters
      const paramDef = parameters.find((p) => p.name === name);
      if (!paramDef) return prev;
      
      return [...prev, { ...paramDef, value }];
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock results
      const mockResults = Array.from({ length: 10 }, (_, i) => ({
        id: `result-${i}`,
        strategy: formData.strategy,
        exchange: formData.exchange,
        symbol: formData.symbol,
        timeframe: formData.timeframe,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        parameters: parameters.map((p) => ({
          name: p.name,
          value: p.value,
        })),
        metrics: {
          profitLoss: Math.random() * 100 - 20,
          trades: Math.floor(Math.random() * 100) + 20,
          winRate: Math.random() * 30 + 40,
          maxDrawdown: Math.random() * 20,
          sharpeRatio: Math.random() * 2 + 0.5,
        },
        chartData: Array.from({ length: 100 }, (_, i) => ({
          time: new Date(Date.now() - (100 - i) * 86400000).toISOString(),
          value: formData.initialBalance * (1 + (i / 100) * (Math.random() * 0.5)),
        })),
      }));

      setResults(mockResults);
    } catch (error) {
      console.error('Error during optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Strategy Optimization
        </Typography>

        <Grid container spacing={3}>
          {/* Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Optimization Settings
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Strategy</InputLabel>
                    <Select
                      value={formData.strategy}
                      label="Strategy"
                      onChange={(e) => handleStrategyChange(e.target.value)}
                    >
                      {strategies.map((strategy) => (
                        <MenuItem key={strategy} value={strategy}>
                          {strategy}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Exchange</InputLabel>
                    <Select
                      value={formData.exchange}
                      label="Exchange"
                      onChange={(e) =>
                        handleInputChange('exchange', e.target.value)
                      }
                    >
                      {exchanges.map((exchange) => (
                        <MenuItem key={exchange} value={exchange}>
                          {exchange}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Symbol"
                    value={formData.symbol}
                    onChange={(e) =>
                      handleInputChange('symbol', e.target.value)
                    }
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={formData.timeframe}
                      label="Timeframe"
                      onChange={(e) =>
                        handleInputChange('timeframe', e.target.value)
                      }
                    >
                      {timeframes.map((timeframe) => (
                        <MenuItem key={timeframe} value={timeframe}>
                          {timeframe}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => handleInputChange('startDate', date)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Initial Balance"
                    type="number"
                    value={formData.initialBalance}
                    onChange={(e) =>
                      handleInputChange(
                        'initialBalance',
                        parseFloat(e.target.value)
                      )
                    }
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Strategy Parameters */}
          <Grid item xs={12} md={8}>
            {formData.strategy && (
              <StrategyParameters
                strategy={formData.strategy}
                parameters={parameters}
                onChange={handleParameterChange}
              />
            )}

            {parameters.length > 0 && (
              <OptimizationSettings
                strategy={formData.strategy}
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </Grid>

          {/* Results */}
          {results.length > 0 && (
            <Grid item xs={12}>
              <OptimizationResults results={results} />
            </Grid>
          )}

          {/* Loading Indicator */}
          {loading && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 3,
                }}
              >
                <CircularProgress />
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default OptimizePage; 