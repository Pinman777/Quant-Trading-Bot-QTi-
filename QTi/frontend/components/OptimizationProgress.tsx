import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface OptimizationProgress {
  status: string;
  current_iteration: number;
  total_iterations: number;
  best_fitness: number;
  best_params: Record<string, number>;
  fitness_history: number[];
}

interface OptimizationProgressProps {
  optimizationId: string;
}

export const OptimizationProgress: React.FC<OptimizationProgressProps> = ({ optimizationId }) => {
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/optimization/${optimizationId}/progress`);
        if (!response.ok) {
          throw new Error('Failed to fetch optimization progress');
        }
        const data = await response.json();
        setProgress(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [optimizationId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!progress) {
    return null;
  }

  const progressPercentage = (progress.current_iteration / progress.total_iterations) * 100;
  const statusColor = progress.status === 'running' ? 'primary' : 
                     progress.status === 'completed' ? 'success' : 
                     progress.status === 'failed' ? 'error' : 'default';

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Optimization Status: {progress.status}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Progress: {progressPercentage.toFixed(1)}%
        </Typography>
        <Typography variant="body1" gutterBottom>
          Current Results: {progress.best_fitness.toFixed(4)}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Best Parameters
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(progress.best_params).map(([param, value]) => (
                <TableRow key={param}>
                  <TableCell>{param}</TableCell>
                  <TableCell align="right">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Fitness Evolution
        </Typography>
        <Box sx={{ height: 300 }}>
          <LineChart
            series={[
              {
                data: progress.fitness_history,
                area: true,
                label: 'Fitness',
              },
            ]}
            xAxis={[{ scaleType: 'point', data: progress.fitness_history.map((_, i) => i) }]}
            height={300}
          />
        </Box>
      </Paper>
    </Box>
  );
}; 