import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';

interface Parameter {
  name: string;
  type: 'number' | 'boolean' | 'string';
  min?: number;
  max?: number;
  step?: number;
  values?: string[];
}

interface OptimizationResult {
  id: string;
  parameters: {
    [key: string]: number | boolean | string;
  };
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
  };
  createdAt: string;
}

interface OptimizerProps {
  config: {
    id: string;
    name: string;
    strategy: string;
    parameters: Parameter[];
  };
  onStart: (params: any) => Promise<void>;
  onStop: () => Promise<void>;
  onSave: (result: OptimizationResult) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  results: OptimizationResult[];
  loading?: boolean;
  error?: string;
}

const Optimizer: React.FC<OptimizerProps> = ({
  config,
  onStart,
  onStop,
  onSave,
  onDelete,
  onDuplicate,
  results,
  loading = false,
  error,
}) => {
  const [parameterValues, setParameterValues] = useState<{
    [key: string]: number | boolean | string;
  }>({});
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('totalReturn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleParameterChange = (name: string, value: number | boolean | string) => {
    setParameterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStart = async () => {
    try {
      setOptimizationRunning(true);
      await onStart({
        configId: config.id,
        parameters: parameterValues,
        metric: selectedMetric,
      });
    } catch (err) {
      console.error('Failed to start optimization:', err);
    } finally {
      setOptimizationRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await onStop();
    } catch (err) {
      console.error('Failed to stop optimization:', err);
    }
  };

  const handleSort = (metric: string) => {
    if (metric === selectedMetric) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSelectedMetric(metric);
      setSortDirection('desc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a.metrics[selectedMetric as keyof typeof a.metrics];
    const bValue = b.metrics[selectedMetric as keyof typeof b.metrics];
    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Strategy Optimizer: {config.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Optimization Parameters
            </Typography>

            <Grid container spacing={2}>
              {config.parameters.map((param) => (
                <Grid item xs={12} key={param.name}>
                  {param.type === 'number' && (
                    <Box>
                      <Typography gutterBottom>
                        {param.name}
                      </Typography>
                      <Slider
                        value={parameterValues[param.name] as number || param.min || 0}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        onChange={(_, value) => handleParameterChange(param.name, value as number)}
                        valueLabelDisplay="auto"
                      />
                      <TextField
                        fullWidth
                        type="number"
                        value={parameterValues[param.name] || param.min || 0}
                        onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
                        inputProps={{
                          min: param.min,
                          max: param.max,
                          step: param.step,
                        }}
                      />
                    </Box>
                  )}

                  {param.type === 'boolean' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={parameterValues[param.name] as boolean || false}
                          onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                        />
                      }
                      label={param.name}
                    />
                  )}

                  {param.type === 'string' && param.values && (
                    <FormControl fullWidth>
                      <InputLabel>{param.name}</InputLabel>
                      <Select
                        value={parameterValues[param.name] as string || ''}
                        label={param.name}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      >
                        {param.values.map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>
              ))}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Optimization Metric</InputLabel>
                  <Select
                    value={selectedMetric}
                    label="Optimization Metric"
                    onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    <MenuItem value="totalReturn">Total Return</MenuItem>
                    <MenuItem value="sharpeRatio">Sharpe Ratio</MenuItem>
                    <MenuItem value="maxDrawdown">Max Drawdown</MenuItem>
                    <MenuItem value="winRate">Win Rate</MenuItem>
                    <MenuItem value="profitFactor">Profit Factor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color={optimizationRunning ? 'error' : 'primary'}
                  startIcon={optimizationRunning ? <StopIcon /> : <StartIcon />}
                  onClick={optimizationRunning ? handleStop : handleStart}
                  disabled={loading}
                  fullWidth
                >
                  {optimizationRunning ? 'Stop Optimization' : 'Start Optimization'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Optimization Results
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Parameters</TableCell>
                      <TableCell
                        align="right"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('totalReturn')}
                      >
                        Total Return
                        {selectedMetric === 'totalReturn' && (
                          <Typography component="span" sx={{ ml: 1 }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('sharpeRatio')}
                      >
                        Sharpe Ratio
                        {selectedMetric === 'sharpeRatio' && (
                          <Typography component="span" sx={{ ml: 1 }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('maxDrawdown')}
                      >
                        Max Drawdown
                        {selectedMetric === 'maxDrawdown' && (
                          <Typography component="span" sx={{ ml: 1 }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('winRate')}
                      >
                        Win Rate
                        {selectedMetric === 'winRate' && (
                          <Typography component="span" sx={{ ml: 1 }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('profitFactor')}
                      >
                        Profit Factor
                        {selectedMetric === 'profitFactor' && (
                          <Typography component="span" sx={{ ml: 1 }}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {Object.entries(result.parameters)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: result.metrics.totalReturn >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {result.metrics.totalReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {result.metrics.sharpeRatio.toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: 'error.main' }}
                        >
                          {result.metrics.maxDrawdown.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {result.metrics.winRate.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {result.metrics.profitFactor.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Save">
                            <IconButton
                              size="small"
                              onClick={() => onSave(result)}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate">
                            <IconButton
                              size="small"
                              onClick={() => onDuplicate(result.id)}
                            >
                              <DuplicateIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(result.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Optimizer; 