import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface OptimizationParameter {
  name: string;
  min: number;
  max: number;
  step: number;
  current: number;
}

interface OptimizationResult {
  parameters: { [key: string]: number };
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
}

interface StrategyOptimizerProps {
  botId: string;
  strategy: string;
}

const StrategyOptimizer: React.FC<StrategyOptimizerProps> = ({ botId, strategy }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parameters, setParameters] = useState<OptimizationParameter[]>([]);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [optimizationSettings, setOptimizationSettings] = useState({
    populationSize: 50,
    generations: 20,
    crossoverRate: 0.8,
    mutationRate: 0.1,
    objective: 'sharpe_ratio',
    useParallel: true
  });

  useEffect(() => {
    fetchStrategyParameters();
  }, [botId, strategy]);

  const fetchStrategyParameters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/strategy/${strategy}/parameters`);
      if (!response.ok) {
        throw new Error('Failed to fetch strategy parameters');
      }

      const data = await response.json();
      setParameters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (index: number, field: string, value: number) => {
    setParameters(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSettingsChange = (field: string, value: string | number | boolean) => {
    setOptimizationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRunOptimization = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/bots/${botId}/strategy/${strategy}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parameters,
          settings: optimizationSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run optimization');
      }

      const data = await response.json();
      setResults(data);
      setSuccess('Optimization completed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveParameters = async (result: OptimizationResult) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/strategy/${strategy}/parameters`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.parameters)
      });

      if (!response.ok) {
        throw new Error('Failed to save parameters');
      }

      setSuccess('Parameters saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !parameters.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Strategy Optimizer
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Optimization Parameters */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Optimization Parameters
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Step</TableCell>
                    <TableCell>Current</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parameters.map((param, index) => (
                    <TableRow key={param.name}>
                      <TableCell>{param.name}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={param.min}
                          onChange={(e) => handleParameterChange(index, 'min', Number(e.target.value))}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={param.max}
                          onChange={(e) => handleParameterChange(index, 'max', Number(e.target.value))}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={param.step}
                          onChange={(e) => handleParameterChange(index, 'step', Number(e.target.value))}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={param.current}
                          onChange={(e) => handleParameterChange(index, 'current', Number(e.target.value))}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Optimization Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Optimization Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Population Size"
                  value={optimizationSettings.populationSize}
                  onChange={(e) => handleSettingsChange('populationSize', Number(e.target.value))}
                  inputProps={{ min: 10, max: 1000 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Generations"
                  value={optimizationSettings.generations}
                  onChange={(e) => handleSettingsChange('generations', Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Crossover Rate"
                  value={optimizationSettings.crossoverRate}
                  onChange={(e) => handleSettingsChange('crossoverRate', Number(e.target.value))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Mutation Rate"
                  value={optimizationSettings.mutationRate}
                  onChange={(e) => handleSettingsChange('mutationRate', Number(e.target.value))}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Objective</InputLabel>
                  <Select
                    value={optimizationSettings.objective}
                    label="Objective"
                    onChange={(e) => handleSettingsChange('objective', e.target.value)}
                  >
                    <MenuItem value="sharpe_ratio">Sharpe Ratio</MenuItem>
                    <MenuItem value="total_return">Total Return</MenuItem>
                    <MenuItem value="win_rate">Win Rate</MenuItem>
                    <MenuItem value="max_drawdown">Max Drawdown</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={optimizationSettings.useParallel}
                      onChange={(e) => handleSettingsChange('useParallel', e.target.checked)}
                    />
                  }
                  label="Use Parallel Processing"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Optimization Results */}
          {results.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Optimization Results
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Parameters</TableCell>
                      <TableCell>Total Return</TableCell>
                      <TableCell>Sharpe Ratio</TableCell>
                      <TableCell>Max Drawdown</TableCell>
                      <TableCell>Win Rate</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {Object.entries(result.parameters).map(([key, value]) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{result.metrics.totalReturn.toFixed(2)}%</TableCell>
                        <TableCell>{result.metrics.sharpeRatio.toFixed(2)}</TableCell>
                        <TableCell>{result.metrics.maxDrawdown.toFixed(2)}%</TableCell>
                        <TableCell>{result.metrics.winRate.toFixed(2)}%</TableCell>
                        <TableCell>
                          <Tooltip title="Save Parameters">
                            <IconButton
                              onClick={() => handleSaveParameters(result)}
                              disabled={loading}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunOptimization}
            disabled={loading}
          >
            Run Optimization
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StrategyOptimizer; 