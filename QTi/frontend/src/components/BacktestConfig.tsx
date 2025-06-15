import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BotConfig } from '../types/bot';

interface BacktestConfigProps {
  onRun: (config: {
    strategy: string;
    timeframe: string;
    symbol: string;
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    config: BotConfig;
  }) => void;
  loading?: boolean;
}

export const BacktestConfig: React.FC<BacktestConfigProps> = ({
  onRun,
  loading = false
}) => {
  const [strategy, setStrategy] = useState('ma_crossover');
  const [timeframe, setTimeframe] = useState('1h');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [initialCapital, setInitialCapital] = useState(10000);
  const [error, setError] = useState<string | null>(null);

  // Strategy-specific parameters
  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({
    ma_crossover: {
      fastPeriod: 9,
      slowPeriod: 21,
      maType: 'ema'
    },
    rsi: {
      period: 14,
      overbought: 70,
      oversold: 30
    }
  });

  const handleStrategyChange = (newStrategy: string) => {
    setStrategy(newStrategy);
    setStrategyParams({
      ...strategyParams,
      [newStrategy]: strategyParams[newStrategy] || {}
    });
  };

  const handleParamChange = (param: string, value: any) => {
    setStrategyParams({
      ...strategyParams,
      [strategy]: {
        ...strategyParams[strategy],
        [param]: value
      }
    });
  };

  const validateConfig = (): boolean => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }

    if (startDate >= endDate) {
      setError('Start date must be before end date');
      return false;
    }

    if (initialCapital <= 0) {
      setError('Initial capital must be greater than 0');
      return false;
    }

    setError(null);
    return true;
  };

  const handleRun = () => {
    if (!validateConfig()) {
      return;
    }

    onRun({
      strategy,
      timeframe,
      symbol,
      startDate: startDate!,
      endDate: endDate!,
      initialCapital,
      config: {
        strategy,
        timeframe,
        ...strategyParams[strategy]
      }
    });
  };

  const renderStrategyParams = () => {
    switch (strategy) {
      case 'ma_crossover':
        return (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fast MA Period"
                type="number"
                value={strategyParams.ma_crossover.fastPeriod}
                onChange={(e) =>
                  handleParamChange('fastPeriod', Number(e.target.value))
                }
                inputProps={{ min: 2, max: 200 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Slow MA Period"
                type="number"
                value={strategyParams.ma_crossover.slowPeriod}
                onChange={(e) =>
                  handleParamChange('slowPeriod', Number(e.target.value))
                }
                inputProps={{ min: 2, max: 200 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>MA Type</InputLabel>
                <Select
                  value={strategyParams.ma_crossover.maType}
                  label="MA Type"
                  onChange={(e) => handleParamChange('maType', e.target.value)}
                >
                  <MenuItem value="sma">Simple Moving Average</MenuItem>
                  <MenuItem value="ema">Exponential Moving Average</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );

      case 'rsi':
        return (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="RSI Period"
                type="number"
                value={strategyParams.rsi.period}
                onChange={(e) =>
                  handleParamChange('period', Number(e.target.value))
                }
                inputProps={{ min: 2, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Overbought Level"
                type="number"
                value={strategyParams.rsi.overbought}
                onChange={(e) =>
                  handleParamChange('overbought', Number(e.target.value))
                }
                inputProps={{ min: 50, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Oversold Level"
                type="number"
                value={strategyParams.rsi.oversold}
                onChange={(e) =>
                  handleParamChange('oversold', Number(e.target.value))
                }
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Backtest Configuration
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={strategy}
                label="Strategy"
                onChange={(e) => handleStrategyChange(e.target.value)}
              >
                <MenuItem value="ma_crossover">MA Crossover</MenuItem>
                <MenuItem value="rsi">RSI</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Initial Capital"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              inputProps={{ min: 0, step: 1000 }}
            />
          </Grid>

          {renderStrategyParams()}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleRun}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Run Backtest
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 