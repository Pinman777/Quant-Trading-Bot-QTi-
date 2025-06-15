import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Parameter } from '../backtest/StrategyParameters';

interface OptimizationSettingsProps {
  strategy: string;
  parameters: Parameter[];
  onParameterChange: (name: string, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
}

interface ParameterRange {
  name: string;
  min: number;
  max: number;
  step: number;
}

const OptimizationSettings: React.FC<OptimizationSettingsProps> = ({
  strategy,
  parameters,
  onParameterChange,
  onSubmit,
  loading,
}) => {
  const [ranges, setRanges] = React.useState<ParameterRange[]>([]);

  const handleRangeChange = (
    name: string,
    field: 'min' | 'max' | 'step',
    value: number
  ) => {
    setRanges((prev) => {
      const existing = prev.find((r) => r.name === name);
      if (existing) {
        return prev.map((r) =>
          r.name === name ? { ...r, [field]: value } : r
        );
      }
      return [
        ...prev,
        {
          name,
          min: field === 'min' ? value : 0,
          max: field === 'max' ? value : 100,
          step: field === 'step' ? value : 1,
        },
      ];
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Optimization Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Parameter Ranges
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set the range and step size for each parameter to optimize. The
            optimizer will test all combinations within these ranges.
          </Typography>
        </Grid>

        {parameters.map((param) => {
          if (param.type === 'number') {
            const range = ranges.find((r) => r.name === param.name);
            return (
              <Grid item xs={12} key={param.name}>
                <Typography variant="subtitle2" gutterBottom>
                  {param.label}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Min"
                      type="number"
                      value={range?.min || param.min || 0}
                      onChange={(e) =>
                        handleRangeChange(
                          param.name,
                          'min',
                          parseFloat(e.target.value)
                        )
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Max"
                      type="number"
                      value={range?.max || param.max || 100}
                      onChange={(e) =>
                        handleRangeChange(
                          param.name,
                          'max',
                          parseFloat(e.target.value)
                        )
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Step"
                      type="number"
                      value={range?.step || param.step || 1}
                      onChange={(e) =>
                        handleRangeChange(
                          param.name,
                          'step',
                          parseFloat(e.target.value)
                        )
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
            );
          }
          return null;
        })}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={loading || ranges.length === 0}
            >
              {loading ? 'Optimizing...' : 'Start Optimization'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OptimizationSettings; 