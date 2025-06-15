import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import { BotConfig } from '../types/bot';

interface ConfigEditorProps {
  config: BotConfig;
  onChange: (config: BotConfig) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface StrategyParam {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description: string;
  defaultValue: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

const strategyParams: Record<string, StrategyParam[]> = {
  ma_crossover: [
    {
      name: 'fastPeriod',
      type: 'number',
      label: 'Fast MA Period',
      description: 'Period for the fast moving average',
      defaultValue: 9,
      min: 2,
      max: 200
    },
    {
      name: 'slowPeriod',
      type: 'number',
      label: 'Slow MA Period',
      description: 'Period for the slow moving average',
      defaultValue: 21,
      min: 2,
      max: 200
    },
    {
      name: 'maType',
      type: 'select',
      label: 'MA Type',
      description: 'Type of moving average to use',
      defaultValue: 'ema',
      options: [
        { value: 'sma', label: 'Simple Moving Average' },
        { value: 'ema', label: 'Exponential Moving Average' }
      ]
    }
  ],
  rsi: [
    {
      name: 'period',
      type: 'number',
      label: 'RSI Period',
      description: 'Period for RSI calculation',
      defaultValue: 14,
      min: 2,
      max: 100
    },
    {
      name: 'overbought',
      type: 'number',
      label: 'Overbought Level',
      description: 'RSI level considered overbought',
      defaultValue: 70,
      min: 50,
      max: 100
    },
    {
      name: 'oversold',
      type: 'number',
      label: 'Oversold Level',
      description: 'RSI level considered oversold',
      defaultValue: 30,
      min: 0,
      max: 50
    }
  ]
};

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
  config,
  onChange,
  onSave,
  onCancel
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!config.strategy) {
      newErrors.strategy = 'Strategy is required';
    }
    if (!config.timeframe) {
      newErrors.timeframe = 'Timeframe is required';
    }
    if (config.positionSize && config.positionSize <= 0) {
      newErrors.positionSize = 'Position size must be greater than 0';
    }
    if (config.leverage && (config.leverage < 1 || config.leverage > 100)) {
      newErrors.leverage = 'Leverage must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onSave();
    }
  };

  const handleChange = (field: string, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const renderStrategyParams = () => {
    const params = strategyParams[config.strategy] || [];
    return params.map((param) => (
      <Grid item xs={12} md={6} key={param.name}>
        <FormControl fullWidth>
          {param.type === 'select' ? (
            <>
              <InputLabel>{param.label}</InputLabel>
              <Select
                value={config[param.name] || param.defaultValue}
                label={param.label}
                onChange={(e) => handleChange(param.name, e.target.value)}
                error={!!errors[param.name]}
              >
                {param.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </>
          ) : (
            <TextField
              label={param.label}
              type={param.type === 'number' ? 'number' : 'text'}
              value={config[param.name] || param.defaultValue}
              onChange={(e) => handleChange(param.name, e.target.value)}
              error={!!errors[param.name]}
              helperText={errors[param.name]}
              inputProps={{
                min: param.min,
                max: param.max,
                step: param.step
              }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            {param.description}
          </Typography>
        </FormControl>
      </Grid>
    ));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bot Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.strategy}>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={config.strategy}
                label="Strategy"
                onChange={(e) => handleChange('strategy', e.target.value)}
              >
                <MenuItem value="ma_crossover">MA Crossover</MenuItem>
                <MenuItem value="rsi">RSI</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.timeframe}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={config.timeframe}
                label="Timeframe"
                onChange={(e) => handleChange('timeframe', e.target.value)}
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

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Strategy Parameters
            </Typography>
          </Grid>

          {renderStrategyParams()}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Risk Management
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Position Size"
              type="number"
              value={config.positionSize || ''}
              onChange={(e) => handleChange('positionSize', Number(e.target.value))}
              error={!!errors.positionSize}
              helperText={errors.positionSize}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Leverage"
              type="number"
              value={config.leverage || ''}
              onChange={(e) => handleChange('leverage', Number(e.target.value))}
              error={!!errors.leverage}
              helperText={errors.leverage}
              InputProps={{
                inputProps: { min: 1, max: 100 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Stop Loss (%)"
              type="number"
              value={config.stopLoss || ''}
              onChange={(e) => handleChange('stopLoss', Number(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.1 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Take Profit (%)"
              type="number"
              value={config.takeProfit || ''}
              onChange={(e) => handleChange('takeProfit', Number(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 1000, step: 0.1 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Trailing Stop (%)"
              type="number"
              value={config.trailingStop || ''}
              onChange={(e) => handleChange('trailingStop', Number(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 100, step: 0.1 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Positions"
              type="number"
              value={config.maxPositions || ''}
              onChange={(e) => handleChange('maxPositions', Number(e.target.value))}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave}>
                Save Configuration
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 