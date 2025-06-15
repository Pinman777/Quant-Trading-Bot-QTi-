import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Indicator {
  name: string;
  type: string;
  params: { [key: string]: number };
  color: string;
}

interface ChartIndicatorsProps {
  onAddIndicator: (indicator: Indicator) => void;
  onRemoveIndicator: (name: string) => void;
  indicators: Indicator[];
}

const AVAILABLE_INDICATORS = [
  {
    name: 'SMA',
    type: 'sma',
    params: {
      period: 20
    }
  },
  {
    name: 'EMA',
    type: 'ema',
    params: {
      period: 20
    }
  },
  {
    name: 'RSI',
    type: 'rsi',
    params: {
      period: 14
    }
  },
  {
    name: 'MACD',
    type: 'macd',
    params: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    }
  },
  {
    name: 'Bollinger Bands',
    type: 'bb',
    params: {
      period: 20,
      stdDev: 2
    }
  }
];

const COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#F44336', // Red
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FFEB3B', // Yellow
  '#795548'  // Brown
];

const ChartIndicators: React.FC<ChartIndicatorsProps> = ({
  onAddIndicator,
  onRemoveIndicator,
  indicators
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [params, setParams] = useState<{ [key: string]: number }>({});
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const indicator = AVAILABLE_INDICATORS.find(i => i.type === type);
    if (indicator) {
      setParams(indicator.params);
    }
  };

  const handleParamChange = (param: string, value: string) => {
    setParams(prev => ({
      ...prev,
      [param]: Number(value)
    }));
  };

  const handleAddIndicator = () => {
    const indicator = AVAILABLE_INDICATORS.find(i => i.type === selectedType);
    if (indicator) {
      onAddIndicator({
        name: indicator.name,
        type: selectedType,
        params,
        color: selectedColor
      });
      setSelectedType('');
      setParams({});
      setSelectedColor(COLORS[0]);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Chart Indicators
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {indicators.map((indicator) => (
              <Chip
                key={indicator.name}
                label={indicator.name}
                onDelete={() => onRemoveIndicator(indicator.name)}
                deleteIcon={<DeleteIcon />}
                sx={{ bgcolor: indicator.color, color: 'white' }}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Indicator Type</InputLabel>
            <Select
              value={selectedType}
              label="Indicator Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {AVAILABLE_INDICATORS.map((indicator) => (
                <MenuItem key={indicator.type} value={indicator.type}>
                  {indicator.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={selectedColor}
              label="Color"
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      bgcolor: color,
                      borderRadius: 1,
                      mr: 1
                    }}
                  />
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedType && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {Object.entries(params).map(([param, value]) => (
              <TextField
                key={param}
                label={param.charAt(0).toUpperCase() + param.slice(1)}
                type="number"
                value={value}
                onChange={(e) => handleParamChange(param, e.target.value)}
                fullWidth
              />
            ))}
          </Box>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddIndicator}
          disabled={!selectedType}
          fullWidth
        >
          Add Indicator
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChartIndicators; 