import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Save as SaveIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

interface BacktestSettingsProps {
  botId: string;
}

interface BacktestConfig {
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  initialCapital: number;
  tradingParams: {
    commission: number;
    slippage: number;
    useRealisticSlippage: boolean;
    useRealisticCommissions: boolean;
  };
  riskManagement: {
    maxOpenPositions: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    positionSizing: 'fixed' | 'percentage' | 'risk';
    fixedAmount?: number;
    percentageAmount?: number;
    riskAmount?: number;
  };
  stopLoss: {
    enabled: boolean;
    type: 'fixed' | 'trailing' | 'atr';
    value: number;
    atrPeriod?: number;
    atrMultiplier?: number;
  };
  takeProfit: {
    enabled: boolean;
    type: 'fixed' | 'trailing' | 'atr';
    value: number;
    atrPeriod?: number;
    atrMultiplier?: number;
  };
}

const BacktestSettings: React.FC<BacktestSettingsProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<BacktestConfig>({
    timeRange: {
      startDate: new Date(),
      endDate: new Date()
    },
    initialCapital: 10000,
    tradingParams: {
      commission: 0.1,
      slippage: 0.1,
      useRealisticSlippage: true,
      useRealisticCommissions: true
    },
    riskManagement: {
      maxOpenPositions: 3,
      maxDailyLoss: 5,
      maxDrawdown: 10,
      positionSizing: 'fixed',
      fixedAmount: 1000
    },
    stopLoss: {
      enabled: true,
      type: 'fixed',
      value: 2,
      atrPeriod: 14,
      atrMultiplier: 2
    },
    takeProfit: {
      enabled: true,
      type: 'fixed',
      value: 4,
      atrPeriod: 14,
      atrMultiplier: 3
    }
  });

  useEffect(() => {
    fetchSettings();
  }, [botId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/backtest-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch backtest settings');
      }

      const data = await response.json();
      setConfig({
        ...data,
        timeRange: {
          startDate: new Date(data.timeRange.startDate),
          endDate: new Date(data.timeRange.endDate)
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/bots/${botId}/backtest-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save backtest settings');
      }

      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config.initialCapital) {
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimelineIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Backtest Settings</Typography>
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Time Range</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={config.timeRange.startDate}
                    onChange={(date) => setConfig(prev => ({
                      ...prev,
                      timeRange: {
                        ...prev.timeRange,
                        startDate: date || new Date()
                      }
                    }))}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={config.timeRange.endDate}
                    onChange={(date) => setConfig(prev => ({
                      ...prev,
                      timeRange: {
                        ...prev.timeRange,
                        endDate: date || new Date()
                      }
                    }))}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Initial Capital</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Capital"
                  value={config.initialCapital}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    initialCapital: Number(e.target.value)
                  }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Trading Parameters</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Commission (%)"
                  value={config.tradingParams.commission}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tradingParams: {
                      ...prev.tradingParams,
                      commission: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Slippage (%)"
                  value={config.tradingParams.slippage}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    tradingParams: {
                      ...prev.tradingParams,
                      slippage: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.tradingParams.useRealisticSlippage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        tradingParams: {
                          ...prev.tradingParams,
                          useRealisticSlippage: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Use Realistic Slippage"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.tradingParams.useRealisticCommissions}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        tradingParams: {
                          ...prev.tradingParams,
                          useRealisticCommissions: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Use Realistic Commissions"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Risk Management</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Open Positions"
                  value={config.riskManagement.maxOpenPositions}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    riskManagement: {
                      ...prev.riskManagement,
                      maxOpenPositions: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Daily Loss (%)"
                  value={config.riskManagement.maxDailyLoss}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    riskManagement: {
                      ...prev.riskManagement,
                      maxDailyLoss: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Drawdown (%)"
                  value={config.riskManagement.maxDrawdown}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    riskManagement: {
                      ...prev.riskManagement,
                      maxDrawdown: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Position Sizing</InputLabel>
                  <Select
                    value={config.riskManagement.positionSizing}
                    label="Position Sizing"
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        positionSizing: e.target.value as 'fixed' | 'percentage' | 'risk'
                      }
                    }))}
                  >
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="risk">Risk Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {config.riskManagement.positionSizing === 'fixed' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fixed Amount"
                    value={config.riskManagement.fixedAmount}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        fixedAmount: Number(e.target.value)
                      }
                    }))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              )}
              {config.riskManagement.positionSizing === 'percentage' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Percentage Amount"
                    value={config.riskManagement.percentageAmount}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        percentageAmount: Number(e.target.value)
                      }
                    }))}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              )}
              {config.riskManagement.positionSizing === 'risk' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Risk Amount"
                    value={config.riskManagement.riskAmount}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      riskManagement: {
                        ...prev.riskManagement,
                        riskAmount: Number(e.target.value)
                      }
                    }))}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Stop Loss</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.stopLoss.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        stopLoss: {
                          ...prev.stopLoss,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable Stop Loss"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Stop Loss Type</InputLabel>
                  <Select
                    value={config.stopLoss.type}
                    label="Stop Loss Type"
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      stopLoss: {
                        ...prev.stopLoss,
                        type: e.target.value as 'fixed' | 'trailing' | 'atr'
                      }
                    }))}
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="trailing">Trailing</MenuItem>
                    <MenuItem value="atr">ATR Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stop Loss Value (%)"
                  value={config.stopLoss.value}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    stopLoss: {
                      ...prev.stopLoss,
                      value: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              {config.stopLoss.type === 'atr' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="ATR Period"
                      value={config.stopLoss.atrPeriod}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        stopLoss: {
                          ...prev.stopLoss,
                          atrPeriod: Number(e.target.value)
                        }
                      }))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="ATR Multiplier"
                      value={config.stopLoss.atrMultiplier}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        stopLoss: {
                          ...prev.stopLoss,
                          atrMultiplier: Number(e.target.value)
                        }
                      }))}
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Take Profit</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.takeProfit.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        takeProfit: {
                          ...prev.takeProfit,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable Take Profit"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Take Profit Type</InputLabel>
                  <Select
                    value={config.takeProfit.type}
                    label="Take Profit Type"
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      takeProfit: {
                        ...prev.takeProfit,
                        type: e.target.value as 'fixed' | 'trailing' | 'atr'
                      }
                    }))}
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="trailing">Trailing</MenuItem>
                    <MenuItem value="atr">ATR Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Take Profit Value (%)"
                  value={config.takeProfit.value}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    takeProfit: {
                      ...prev.takeProfit,
                      value: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              {config.takeProfit.type === 'atr' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="ATR Period"
                      value={config.takeProfit.atrPeriod}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        takeProfit: {
                          ...prev.takeProfit,
                          atrPeriod: Number(e.target.value)
                        }
                      }))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="ATR Multiplier"
                      value={config.takeProfit.atrMultiplier}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        takeProfit: {
                          ...prev.takeProfit,
                          atrMultiplier: Number(e.target.value)
                        }
                      }))}
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
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

export default BacktestSettings; 