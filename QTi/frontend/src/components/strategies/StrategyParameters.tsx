import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

interface Parameter {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

interface StrategyParametersProps {
  type: string;
  parameters: { [key: string]: any };
  onChange: (parameters: { [key: string]: any }) => void;
}

const getDefaultParameters = (type: string): Parameter[] => {
  switch (type) {
    case 'grid':
      return [
        {
          name: 'gridSize',
          label: 'Размер сетки',
          type: 'number',
          value: 10,
          min: 1,
          max: 100,
          description: 'Количество уровней в сетке',
        },
        {
          name: 'gridStep',
          label: 'Шаг сетки',
          type: 'number',
          value: 100,
          min: 1,
          step: 0.1,
          description: 'Расстояние между уровнями в USDT',
        },
        {
          name: 'totalInvestment',
          label: 'Общая инвестиция',
          type: 'number',
          value: 1000,
          min: 10,
          step: 10,
          description: 'Общая сумма инвестиций в USDT',
        },
        {
          name: 'takeProfit',
          label: 'Take Profit',
          type: 'number',
          value: 2,
          min: 0.1,
          max: 100,
          step: 0.1,
          description: 'Процент прибыли для закрытия позиции',
        },
        {
          name: 'stopLoss',
          label: 'Stop Loss',
          type: 'number',
          value: 1,
          min: 0.1,
          max: 100,
          step: 0.1,
          description: 'Процент убытка для закрытия позиции',
        },
      ];
    case 'dca':
      return [
        {
          name: 'baseOrder',
          label: 'Базовый ордер',
          type: 'number',
          value: 0.1,
          min: 0.001,
          step: 0.001,
          description: 'Размер базового ордера в BTC',
        },
        {
          name: 'stepSize',
          label: 'Шаг увеличения',
          type: 'number',
          value: 0.05,
          min: 0.001,
          step: 0.001,
          description: 'Шаг увеличения размера ордера',
        },
        {
          name: 'maxOrders',
          label: 'Максимум ордеров',
          type: 'number',
          value: 5,
          min: 1,
          max: 20,
          description: 'Максимальное количество ордеров',
        },
        {
          name: 'priceDeviation',
          label: 'Отклонение цены',
          type: 'number',
          value: 2,
          min: 0.1,
          max: 10,
          step: 0.1,
          description: 'Процент отклонения цены для нового ордера',
        },
      ];
    case 'rsi':
      return [
        {
          name: 'period',
          label: 'Период RSI',
          type: 'number',
          value: 14,
          min: 2,
          max: 50,
          description: 'Период для расчета RSI',
        },
        {
          name: 'overbought',
          label: 'Перекупленность',
          type: 'number',
          value: 70,
          min: 50,
          max: 100,
          description: 'Уровень перекупленности',
        },
        {
          name: 'oversold',
          label: 'Перепроданность',
          type: 'number',
          value: 30,
          min: 0,
          max: 50,
          description: 'Уровень перепроданности',
        },
        {
          name: 'stopLoss',
          label: 'Stop Loss',
          type: 'number',
          value: 2,
          min: 0.1,
          max: 100,
          step: 0.1,
          description: 'Процент убытка для закрытия позиции',
        },
        {
          name: 'takeProfit',
          label: 'Take Profit',
          type: 'number',
          value: 4,
          min: 0.1,
          max: 100,
          step: 0.1,
          description: 'Процент прибыли для закрытия позиции',
        },
      ];
    default:
      return [];
  }
};

const StrategyParameters: React.FC<StrategyParametersProps> = ({
  type,
  parameters,
  onChange,
}) => {
  const defaultParams = getDefaultParameters(type);

  const handleParameterChange = (name: string, value: any) => {
    onChange({
      ...parameters,
      [name]: value,
    });
  };

  const renderParameterInput = (param: Parameter) => {
    switch (param.type) {
      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={param.label}
            value={parameters[param.name] ?? param.value}
            onChange={(e) =>
              handleParameterChange(param.name, parseFloat(e.target.value))
            }
            inputProps={{
              min: param.min,
              max: param.max,
              step: param.step,
            }}
            helperText={param.description}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{param.label}</InputLabel>
            <Select
              value={parameters[param.name] ?? param.value}
              label={param.label}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
            >
              {param.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={parameters[param.name] ?? param.value}
                onChange={(e) =>
                  handleParameterChange(param.name, e.target.checked)
                }
              />
            }
            label={param.label}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            label={param.label}
            value={parameters[param.name] ?? param.value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            helperText={param.description}
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Параметры стратегии
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {defaultParams.map((param) => (
          <Grid item xs={12} md={6} key={param.name}>
            {renderParameterInput(param)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StrategyParameters; 