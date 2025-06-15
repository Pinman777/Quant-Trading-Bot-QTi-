import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Stack
} from '@mui/material';

export interface Indicator {
  name: string;
  type: string;
  params: Record<string, number | string>;
}

interface TechnicalIndicatorsProps {
  onIndicatorChange: (indicators: Indicator[]) => void;
}

const availableIndicators: Indicator[] = [
  {
    name: 'SMA',
    type: 'overlay',
    params: { period: 20 }
  },
  {
    name: 'EMA',
    type: 'overlay',
    params: { period: 20 }
  },
  {
    name: 'RSI',
    type: 'separate',
    params: { period: 14 }
  },
  {
    name: 'MACD',
    type: 'separate',
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
  },
  {
    name: 'Bollinger Bands',
    type: 'overlay',
    params: { period: 20, multiplier: 2 }
  },
  {
    name: 'Stochastic',
    type: 'separate',
    params: { period: 14, smoothK: 3 }
  },
  {
    name: 'ADX',
    type: 'separate',
    params: { period: 14 }
  }
];

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ onIndicatorChange }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);
  const [params, setParams] = useState<Record<string, number>>({});

  const handleIndicatorSelect = (name: string) => {
    setSelectedIndicator(name);
    const indicator = availableIndicators.find(i => i.name === name);
    if (indicator) {
      setParams(indicator.params as Record<string, number>);
    }
  };

  const handleParamChange = (param: string, value: string) => {
    setParams(prev => ({
      ...prev,
      [param]: Number(value)
    }));
  };

  const handleAddIndicator = () => {
    if (!selectedIndicator) return;

    const indicator = availableIndicators.find(i => i.name === selectedIndicator);
    if (!indicator) return;

    const newIndicator: Indicator = {
      name: indicator.name,
      type: indicator.type,
      params: { ...params }
    };

    const updatedIndicators = [...selectedIndicators, newIndicator];
    setSelectedIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
    setSelectedIndicator('');
  };

  const handleRemoveIndicator = (index: number) => {
    const updatedIndicators = selectedIndicators.filter((_, i) => i !== index);
    setSelectedIndicators(updatedIndicators);
    onIndicatorChange(updatedIndicators);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Technical Indicators
      </Typography>

      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Add Indicator</InputLabel>
          <Select
            value={selectedIndicator}
            onChange={(e) => handleIndicatorSelect(e.target.value)}
            label="Add Indicator"
          >
            {availableIndicators.map((indicator) => (
              <MenuItem key={indicator.name} value={indicator.name}>
                {indicator.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedIndicator && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(params).map(([param, value]) => (
              <TextField
                key={param}
                label={param}
                type="number"
                value={value}
                onChange={(e) => handleParamChange(param, e.target.value)}
                size="small"
              />
            ))}
            <Button
              variant="contained"
              onClick={handleAddIndicator}
              sx={{ mt: 1 }}
            >
              Add
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedIndicators.map((indicator, index) => (
            <Chip
              key={index}
              label={`${indicator.name} (${Object.entries(indicator.params)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')})`}
              onDelete={() => handleRemoveIndicator(index)}
            />
          ))}
        </Box>
      </Stack>
    </Paper>
  );
};

export default TechnicalIndicators; 