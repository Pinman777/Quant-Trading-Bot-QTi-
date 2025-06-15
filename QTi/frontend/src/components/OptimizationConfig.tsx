import { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  Box,
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OptimizationConfig {
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  parameters: {
    gridSize: [number, number];
    gridSpacing: [number, number];
    maxPositions: [number, number];
    stopLoss: [number, number];
    takeProfit: [number, number];
  };
  optimizationMethod: 'grid' | 'genetic' | 'bayesian';
  populationSize?: number;
  generations?: number;
  gridSteps?: number;
}

interface OptimizationConfigProps {
  symbols: string[];
  timeframes: string[];
  onStart: (config: OptimizationConfig) => void;
  isRunning: boolean;
}

export default function OptimizationConfig({
  symbols,
  timeframes,
  onStart,
  isRunning,
}: OptimizationConfigProps) {
  const [config, setConfig] = useState<OptimizationConfig>({
    symbol: '',
    timeframe: '',
    startDate: new Date(),
    endDate: new Date(),
    initialBalance: 1000,
    parameters: {
      gridSize: [5, 20],
      gridSpacing: [0.1, 1],
      maxPositions: [1, 10],
      stopLoss: [1, 5],
      takeProfit: [1, 5],
    },
    optimizationMethod: 'grid',
    gridSteps: 5,
  });

  const handleParameterChange = (
    param: keyof OptimizationConfig['parameters'],
    value: number[]
  ) => {
    setConfig({
      ...config,
      parameters: {
        ...config.parameters,
        [param]: value,
      },
    });
  };

  const handleMethodChange = (method: OptimizationConfig['optimizationMethod']) => {
    setConfig({
      ...config,
      optimizationMethod: method,
    });
  };

  const handleStart = () => {
    onStart(config);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Настройка оптимизации
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={symbols}
              value={config.symbol}
              onChange={(_, value) =>
                setConfig({ ...config, symbol: value || '' })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Торговая пара"
                  fullWidth
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Таймфрейм</InputLabel>
              <Select
                value={config.timeframe}
                onChange={(e) =>
                  setConfig({ ...config, timeframe: e.target.value })
                }
                label="Таймфрейм"
              >
                {timeframes.map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {tf}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Начальная дата"
                value={config.startDate}
                onChange={(date) =>
                  setConfig({ ...config, startDate: date || new Date() })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Конечная дата"
                value={config.endDate}
                onChange={(date) =>
                  setConfig({ ...config, endDate: date || new Date() })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Начальный баланс"
              type="number"
              value={config.initialBalance}
              onChange={(e) =>
                setConfig({
                  ...config,
                  initialBalance: parseFloat(e.target.value),
                })
              }
              fullWidth
              required
              InputProps={{
                inputProps: { min: 0, step: 100 },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Метод оптимизации</InputLabel>
              <Select
                value={config.optimizationMethod}
                onChange={(e) =>
                  handleMethodChange(
                    e.target.value as OptimizationConfig['optimizationMethod']
                  )
                }
                label="Метод оптимизации"
              >
                <MenuItem value="grid">Сетка</MenuItem>
                <MenuItem value="genetic">Генетический</MenuItem>
                <MenuItem value="bayesian">Байесовский</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {config.optimizationMethod === 'grid' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Количество шагов"
                type="number"
                value={config.gridSteps}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    gridSteps: parseInt(e.target.value),
                  })
                }
                fullWidth
                required
                InputProps={{
                  inputProps: { min: 2, max: 10, step: 1 },
                }}
              />
            </Grid>
          )}

          {config.optimizationMethod === 'genetic' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Размер популяции"
                  type="number"
                  value={config.populationSize}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      populationSize: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: 10, max: 100, step: 5 },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Количество поколений"
                  type="number"
                  value={config.generations}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      generations: parseInt(e.target.value),
                    })
                  }
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: 10, max: 100, step: 5 },
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Параметры стратегии
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Размер сетки</Typography>
            <Slider
              value={config.parameters.gridSize}
              onChange={(_, value) =>
                handleParameterChange('gridSize', value as number[])
              }
              valueLabelDisplay="auto"
              min={1}
              max={50}
              marks={[
                { value: 1, label: '1' },
                { value: 50, label: '50' },
              ]}
            />
            <Box display="flex" justifyContent="space-between">
              <Chip label={`Min: ${config.parameters.gridSize[0]}`} size="small" />
              <Chip label={`Max: ${config.parameters.gridSize[1]}`} size="small" />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Шаг сетки (%)</Typography>
            <Slider
              value={config.parameters.gridSpacing}
              onChange={(_, value) =>
                handleParameterChange('gridSpacing', value as number[])
              }
              valueLabelDisplay="auto"
              min={0.1}
              max={5}
              step={0.1}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 5, label: '5' },
              ]}
            />
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={`Min: ${config.parameters.gridSpacing[0]}%`}
                size="small"
              />
              <Chip
                label={`Max: ${config.parameters.gridSpacing[1]}%`}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Макс. позиции</Typography>
            <Slider
              value={config.parameters.maxPositions}
              onChange={(_, value) =>
                handleParameterChange('maxPositions', value as number[])
              }
              valueLabelDisplay="auto"
              min={1}
              max={20}
              marks={[
                { value: 1, label: '1' },
                { value: 20, label: '20' },
              ]}
            />
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={`Min: ${config.parameters.maxPositions[0]}`}
                size="small"
              />
              <Chip
                label={`Max: ${config.parameters.maxPositions[1]}`}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Стоп-лосс (%)</Typography>
            <Slider
              value={config.parameters.stopLoss}
              onChange={(_, value) =>
                handleParameterChange('stopLoss', value as number[])
              }
              valueLabelDisplay="auto"
              min={0.1}
              max={10}
              step={0.1}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 10, label: '10' },
              ]}
            />
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={`Min: ${config.parameters.stopLoss[0]}%`}
                size="small"
              />
              <Chip
                label={`Max: ${config.parameters.stopLoss[1]}%`}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Тейк-профит (%)</Typography>
            <Slider
              value={config.parameters.takeProfit}
              onChange={(_, value) =>
                handleParameterChange('takeProfit', value as number[])
              }
              valueLabelDisplay="auto"
              min={0.1}
              max={10}
              step={0.1}
              marks={[
                { value: 0.1, label: '0.1' },
                { value: 10, label: '10' },
              ]}
            />
            <Box display="flex" justifyContent="space-between">
              <Chip
                label={`Min: ${config.parameters.takeProfit[0]}%`}
                size="small"
              />
              <Chip
                label={`Max: ${config.parameters.takeProfit[1]}%`}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleStart}
                disabled={isRunning}
              >
                {isRunning ? 'Оптимизация...' : 'Начать оптимизацию'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 