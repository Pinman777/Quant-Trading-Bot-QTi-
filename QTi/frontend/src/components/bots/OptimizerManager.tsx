import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Slider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface OptimizationConfig {
  id: string;
  name: string;
  strategy: string;
  parameters: {
    [key: string]: {
      min: number;
      max: number;
      step: number;
    };
  };
  metric: 'sharpe' | 'profit' | 'winrate';
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
}

interface OptimizationResult {
  id: string;
  configId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime: string;
  bestParameters: {
    [key: string]: number;
  };
  bestMetric: number;
  population: Array<{
    parameters: {
      [key: string]: number;
    };
    metrics: {
      sharpe: number;
      profit: number;
      winrate: number;
    };
  }>;
  history: Array<{
    generation: number;
    bestMetric: number;
    averageMetric: number;
  }>;
}

interface OptimizerManagerProps {
  configs: OptimizationConfig[];
  results: OptimizationResult[];
  onRunOptimization: (config: OptimizationConfig) => Promise<void>;
  onStopOptimization: (id: string) => Promise<void>;
  onSaveConfig: (config: OptimizationConfig) => Promise<void>;
  onExportResults: (id: string) => Promise<void>;
}

const OptimizerManager: React.FC<OptimizerManagerProps> = ({
  configs,
  results,
  onRunOptimization,
  onStopOptimization,
  onSaveConfig,
  onExportResults,
}) => {
  const [selectedConfig, setSelectedConfig] = useState<OptimizationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRunOptimization = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onRunOptimization(selectedConfig);
      setSuccess('Optimization started successfully');
    } catch (err) {
      setError('Failed to start optimization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopOptimization = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onStopOptimization(id);
      setSuccess('Optimization stopped successfully');
    } catch (err) {
      setError('Failed to stop optimization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onSaveConfig(selectedConfig);
      setSuccess('Configuration saved successfully');
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onExportResults(id);
      setSuccess('Results exported successfully');
    } catch (err) {
      setError('Failed to export results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (
    paramName: string,
    field: 'min' | 'max' | 'step',
    value: number
  ) => {
    if (!selectedConfig) return;
    setSelectedConfig((prev) => ({
      ...prev!,
      parameters: {
        ...prev!.parameters,
        [paramName]: {
          ...prev!.parameters[paramName],
          [field]: value,
        },
      },
    }));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getChartData = (result: OptimizationResult) => {
    return {
      labels: result.history.map((h) => h.generation),
      datasets: [
        {
          label: 'Best Metric',
          data: result.history.map((h) => h.bestMetric),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Average Metric',
          data: result.history.map((h) => h.averageMetric),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Optimization Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Strategy Optimizer</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveConfig}
            disabled={loading || !selectedConfig}
          >
            Save Config
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={handleRunOptimization}
            disabled={loading || !selectedConfig}
          >
            Run Optimization
          </Button>
        </Box>
      </Box>

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

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedConfig?.name || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({ ...prev!, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={selectedConfig?.strategy || ''}
                    label="Strategy"
                    onChange={(e) =>
                      setSelectedConfig((prev) => ({ ...prev!, strategy: e.target.value }))
                    }
                  >
                    <MenuItem value="grid">Grid Trading</MenuItem>
                    <MenuItem value="dca">DCA</MenuItem>
                    <MenuItem value="momentum">Momentum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Optimization Metric</InputLabel>
                  <Select
                    value={selectedConfig?.metric || ''}
                    label="Optimization Metric"
                    onChange={(e) =>
                      setSelectedConfig((prev) => ({
                        ...prev!,
                        metric: e.target.value as 'sharpe' | 'profit' | 'winrate',
                      }))
                    }
                  >
                    <MenuItem value="sharpe">Sharpe Ratio</MenuItem>
                    <MenuItem value="profit">Total Profit</MenuItem>
                    <MenuItem value="winrate">Win Rate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Population Size"
                  value={selectedConfig?.populationSize || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({
                      ...prev!,
                      populationSize: parseInt(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Generations"
                  value={selectedConfig?.generations || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({
                      ...prev!,
                      generations: parseInt(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Crossover Rate"
                  value={selectedConfig?.crossoverRate || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({
                      ...prev!,
                      crossoverRate: parseFloat(e.target.value),
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Mutation Rate"
                  value={selectedConfig?.mutationRate || ''}
                  onChange={(e) =>
                    setSelectedConfig((prev) => ({
                      ...prev!,
                      mutationRate: parseFloat(e.target.value),
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Best Metric</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.id}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.status}
                          color={
                            result.status === 'completed'
                              ? 'success'
                              : result.status === 'running'
                              ? 'primary'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(result.bestMetric)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {result.status === 'running' ? (
                            <Tooltip title="Stop">
                              <IconButton
                                size="small"
                                onClick={() => handleStopOptimization(result.id)}
                                color="error"
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Export">
                              <IconButton
                                size="small"
                                onClick={() => handleExportResults(result.id)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {results.map((result) => (
          <Grid item xs={12} key={result.id}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Optimization Results: {result.id}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Line data={getChartData(result)} options={chartOptions} />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Best Parameters
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(result.bestParameters).map(([param, value]) => (
                        <TableRow key={param}>
                          <TableCell>{param}</TableCell>
                          <TableCell align="right">{formatNumber(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Population
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameters</TableCell>
                        <TableCell align="right">Sharpe</TableCell>
                        <TableCell align="right">Profit</TableCell>
                        <TableCell align="right">Win Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.population.map((individual, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {Object.entries(individual.parameters)
                              .map(([param, value]) => `${param}: ${formatNumber(value)}`)
                              .join(', ')}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(individual.metrics.sharpe)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(individual.metrics.profit)}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(individual.metrics.winrate)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OptimizerManager; 