import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';

export interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

interface StrategyParametersProps {
  strategy: string;
  parameters: Parameter[];
  onChange: (name: string, value: any) => void;
}

export const getDefaultParameters = (strategy: string): Parameter[] => {
  switch (strategy) {
    case 'Grid Trading':
      return [
        {
          name: 'gridSize',
          label: 'Grid Size',
          type: 'number',
          value: 10,
          min: 1,
          max: 100,
          step: 1,
        },
        {
          name: 'gridSpacing',
          label: 'Grid Spacing (%)',
          type: 'number',
          value: 1,
          min: 0.1,
          max: 10,
          step: 0.1,
        },
        {
          name: 'orderType',
          label: 'Order Type',
          type: 'select',
          value: 'limit',
          options: [
            { value: 'limit', label: 'Limit' },
            { value: 'market', label: 'Market' },
          ],
        },
        {
          name: 'useStopLoss',
          label: 'Use Stop Loss',
          type: 'boolean',
          value: true,
        },
      ];
    case 'DCA':
      return [
        {
          name: 'baseOrderSize',
          label: 'Base Order Size',
          type: 'number',
          value: 100,
          min: 10,
          max: 1000,
          step: 10,
        },
        {
          name: 'dcaMultiplier',
          label: 'DCA Multiplier',
          type: 'number',
          value: 1.5,
          min: 1,
          max: 5,
          step: 0.1,
        },
        {
          name: 'maxOrders',
          label: 'Max Orders',
          type: 'number',
          value: 5,
          min: 1,
          max: 20,
          step: 1,
        },
        {
          name: 'priceDeviation',
          label: 'Price Deviation (%)',
          type: 'number',
          value: 2,
          min: 0.1,
          max: 10,
          step: 0.1,
        },
      ];
    case 'RSI':
      return [
        {
          name: 'rsiPeriod',
          label: 'RSI Period',
          type: 'number',
          value: 14,
          min: 2,
          max: 50,
          step: 1,
        },
        {
          name: 'overbought',
          label: 'Overbought Level',
          type: 'number',
          value: 70,
          min: 50,
          max: 90,
          step: 1,
        },
        {
          name: 'oversold',
          label: 'Oversold Level',
          type: 'number',
          value: 30,
          min: 10,
          max: 50,
          step: 1,
        },
        {
          name: 'useTrailingStop',
          label: 'Use Trailing Stop',
          type: 'boolean',
          value: true,
        },
      ];
    default:
      return [];
  }
};

const StrategyParameters: React.FC<StrategyParametersProps> = ({
  strategy,
  parameters,
  onChange,
}) => {
  const defaultParams = getDefaultParameters(strategy);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Strategy Parameters
      </Typography>
      <Grid container spacing={2}>
        {defaultParams.map((param) => (
          <Grid item xs={12} md={6} key={param.name}>
            {param.type === 'number' && (
              <TextField
                fullWidth
                type="number"
                label={param.label}
                value={parameters.find((p) => p.name === param.name)?.value || param.value}
                onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
                inputProps={{
                  min: param.min,
                  max: param.max,
                  step: param.step,
                }}
              />
            )}
            {param.type === 'select' && (
              <FormControl fullWidth>
                <InputLabel>{param.label}</InputLabel>
                <Select
                  value={parameters.find((p) => p.name === param.name)?.value || param.value}
                  label={param.label}
                  onChange={(e) => onChange(param.name, e.target.value)}
                >
                  {param.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {param.type === 'boolean' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={parameters.find((p) => p.name === param.name)?.value || param.value}
                    onChange={(e) => onChange(param.name, e.target.checked)}
                  />
                }
                label={param.label}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StrategyParameters; 