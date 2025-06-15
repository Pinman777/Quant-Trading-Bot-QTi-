import React, { useState } from 'react';
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
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { BotConfig } from '../types/bot';

interface BotSettingsProps {
  config: BotConfig;
  onSave: (config: BotConfig) => Promise<void>;
  loading?: boolean;
}

const BotSettings: React.FC<BotSettingsProps> = ({
  config,
  onSave,
  loading = false
}) => {
  const [settings, setSettings] = useState<BotConfig>(config);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof BotConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      await onSave(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bot Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Strategy Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Strategy Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={settings.strategy}
                    label="Strategy"
                    onChange={(e) => handleChange('strategy', e.target.value)}
                  >
                    <MenuItem value="ma_crossover">MA Crossover</MenuItem>
                    <MenuItem value="rsi">RSI</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={settings.timeframe}
                    label="Timeframe"
                    onChange={(e) => handleChange('timeframe', e.target.value)}
                  >
                    <MenuItem value="1m">1 minute</MenuItem>
                    <MenuItem value="5m">5 minutes</MenuItem>
                    <MenuItem value="15m">15 minutes</MenuItem>
                    <MenuItem value="1h">1 hour</MenuItem>
                    <MenuItem value="4h">4 hours</MenuItem>
                    <MenuItem value="1d">1 day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Position Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Position Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Leverage"
                  value={settings.leverage || ''}
                  onChange={(e) => handleChange('leverage', Number(e.target.value))}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Position Size (%)"
                  value={settings.positionSize || ''}
                  onChange={(e) => handleChange('positionSize', Number(e.target.value))}
                  inputProps={{ min: 0.1, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Positions"
                  value={settings.maxPositions || ''}
                  onChange={(e) => handleChange('maxPositions', Number(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Risk Per Trade (%)"
                  value={settings.riskPerTrade || ''}
                  onChange={(e) => handleChange('riskPerTrade', Number(e.target.value))}
                  inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Risk Management */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stop Loss (%)"
                  value={settings.stopLoss || ''}
                  onChange={(e) => handleChange('stopLoss', Number(e.target.value))}
                  inputProps={{ min: 0.1, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Take Profit (%)"
                  value={settings.takeProfit || ''}
                  onChange={(e) => handleChange('takeProfit', Number(e.target.value))}
                  inputProps={{ min: 0.1, max: 1000, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Trailing Stop (%)"
                  value={settings.trailingStop || ''}
                  onChange={(e) => handleChange('trailingStop', Number(e.target.value))}
                  inputProps={{ min: 0.1, max: 100, step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Drawdown (%)"
                  value={settings.maxDrawdown || ''}
                  onChange={(e) => handleChange('maxDrawdown', Number(e.target.value))}
                  inputProps={{ min: 1, max: 100, step: 0.1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BotSettings; 