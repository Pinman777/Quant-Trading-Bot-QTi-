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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface StrategySettingsProps {
  botId: string;
}

interface StrategyParameter {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'string' | 'select';
  value: any;
  description: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

interface StrategyTimeframe {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

interface StrategySettings {
  name: string;
  description: string;
  version: string;
  parameters: StrategyParameter[];
  timeframes: StrategyTimeframe[];
  riskManagement: {
    maxOpenPositions: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    positionSizing: 'fixed' | 'percentage' | 'risk';
    fixedAmount?: number;
    percentageAmount?: number;
    riskAmount?: number;
  };
  tradingRules: {
    allowLong: boolean;
    allowShort: boolean;
    maxLeverage: number;
    minVolume: number;
    minVolatility: number;
    maxSpread: number;
  };
}

const StrategySettings: React.FC<StrategySettingsProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<StrategySettings>({
    name: '',
    description: '',
    version: '',
    parameters: [],
    timeframes: [],
    riskManagement: {
      maxOpenPositions: 3,
      maxDailyLoss: 5,
      maxDrawdown: 10,
      positionSizing: 'fixed',
      fixedAmount: 100
    },
    tradingRules: {
      allowLong: true,
      allowShort: true,
      maxLeverage: 1,
      minVolume: 1000,
      minVolatility: 0.1,
      maxSpread: 0.1
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<StrategyParameter | null>(null);
  const [formData, setFormData] = useState<Partial<StrategyParameter>>({
    name: '',
    type: 'number',
    value: '',
    description: '',
    required: false
  });

  useEffect(() => {
    fetchSettings();
  }, [botId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/strategy-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch strategy settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (parameter?: StrategyParameter) => {
    if (parameter) {
      setEditingParameter(parameter);
      setFormData(parameter);
    } else {
      setEditingParameter(null);
      setFormData({
        name: '',
        type: 'number',
        value: '',
        description: '',
        required: false
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingParameter(null);
    setFormData({
      name: '',
      type: 'number',
      value: '',
      description: '',
      required: false
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParameterSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = editingParameter
        ? `/api/bots/${botId}/strategy-settings/parameters/${editingParameter.id}`
        : `/api/bots/${botId}/strategy-settings/parameters`;

      const response = await fetch(url, {
        method: editingParameter ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save parameter');
      }

      setSuccess(editingParameter ? 'Parameter updated successfully' : 'Parameter added successfully');
      handleDialogClose();
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterDelete = async (parameterId: string) => {
    if (!window.confirm('Are you sure you want to delete this parameter?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/strategy-settings/parameters/${parameterId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete parameter');
      }

      setSuccess('Parameter deleted successfully');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeToggle = async (timeframeId: string, enabled: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/strategy-settings/timeframes/${timeframeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update timeframe');
      }

      setSuccess('Timeframe updated successfully');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/bots/${botId}/strategy-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.parameters.length) {
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
          <PsychologyIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Strategy Settings</Typography>
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
              <Typography variant="subtitle1">Basic Information</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Strategy Name"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={settings.version}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    version: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Parameters</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
              >
                Add Parameter
              </Button>
            </Box>

            <List>
              {settings.parameters.map((parameter) => (
                <ListItem
                  key={parameter.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {parameter.name}
                        </Typography>
                        <Chip
                          label={parameter.type}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                        {parameter.required && (
                          <Chip
                            label="Required"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {parameter.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Value: {parameter.value}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleDialogOpen(parameter)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleParameterDelete(parameter.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Timeframes</Typography>
            </Box>
            <Grid container spacing={2}>
              {settings.timeframes.map((timeframe) => (
                <Grid item xs={12} sm={6} md={4} key={timeframe.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1">
                            {timeframe.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {timeframe.value}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={timeframe.enabled}
                              onChange={(e) => handleTimeframeToggle(timeframe.id, e.target.checked)}
                            />
                          }
                          label="Enabled"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
                  value={settings.riskManagement.maxOpenPositions}
                  onChange={(e) => setSettings(prev => ({
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
                  value={settings.riskManagement.maxDailyLoss}
                  onChange={(e) => setSettings(prev => ({
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
                  value={settings.riskManagement.maxDrawdown}
                  onChange={(e) => setSettings(prev => ({
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
                    value={settings.riskManagement.positionSizing}
                    label="Position Sizing"
                    onChange={(e) => setSettings(prev => ({
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
              {settings.riskManagement.positionSizing === 'fixed' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fixed Amount"
                    value={settings.riskManagement.fixedAmount}
                    onChange={(e) => setSettings(prev => ({
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
              {settings.riskManagement.positionSizing === 'percentage' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Percentage Amount"
                    value={settings.riskManagement.percentageAmount}
                    onChange={(e) => setSettings(prev => ({
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
              {settings.riskManagement.positionSizing === 'risk' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Risk Amount"
                    value={settings.riskManagement.riskAmount}
                    onChange={(e) => setSettings(prev => ({
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
              <Typography variant="subtitle1">Trading Rules</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.tradingRules.allowLong}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        tradingRules: {
                          ...prev.tradingRules,
                          allowLong: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Allow Long Positions"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.tradingRules.allowShort}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        tradingRules: {
                          ...prev.tradingRules,
                          allowShort: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Allow Short Positions"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Leverage"
                  value={settings.tradingRules.maxLeverage}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tradingRules: {
                      ...prev.tradingRules,
                      maxLeverage: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Volume"
                  value={settings.tradingRules.minVolume}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tradingRules: {
                      ...prev.tradingRules,
                      minVolume: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Volatility"
                  value={settings.tradingRules.minVolatility}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tradingRules: {
                      ...prev.tradingRules,
                      minVolatility: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Spread"
                  value={settings.tradingRules.maxSpread}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tradingRules: {
                      ...prev.tradingRules,
                      maxSpread: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSettingsSave}
                disabled={loading}
              >
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingParameter ? 'Edit Parameter' : 'Add Parameter'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type"
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Boolean</MenuItem>
                      <MenuItem value="string">String</MenuItem>
                      <MenuItem value="select">Select</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>
                {formData.type === 'number' && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min Value"
                        value={formData.min}
                        onChange={(e) => handleInputChange('min', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Value"
                        value={formData.max}
                        onChange={(e) => handleInputChange('max', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Step"
                        value={formData.step}
                        onChange={(e) => handleInputChange('step', Number(e.target.value))}
                      />
                    </Grid>
                  </>
                )}
                {formData.type === 'select' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Options (comma-separated)"
                      value={formData.options?.join(',')}
                      onChange={(e) => handleInputChange('options', e.target.value.split(','))}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.required}
                        onChange={(e) => handleInputChange('required', e.target.checked)}
                      />
                    }
                    label="Required"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={handleParameterSave}
              variant="contained"
              disabled={loading}
            >
              {editingParameter ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StrategySettings; 