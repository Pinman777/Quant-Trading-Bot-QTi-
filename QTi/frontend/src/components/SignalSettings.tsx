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
  FormControl
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SignalCellularAlt as SignalIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface SignalSettingsProps {
  botId: string;
}

interface SignalCondition {
  id: string;
  name: string;
  type: 'indicator' | 'price' | 'volume' | 'custom';
  enabled: boolean;
  conditions: {
    indicator?: string;
    operator: '>' | '<' | '==' | '>=' | '<=';
    value: number;
    timeframe?: string;
  }[];
  actions: {
    type: 'buy' | 'sell' | 'alert';
    params?: {
      amount?: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    };
  }[];
  cooldown: number;
  priority: number;
}

interface SignalSettings {
  conditions: SignalCondition[];
  defaultCooldown: number;
  maxActiveSignals: number;
  riskManagement: {
    maxOpenPositions: number;
    maxDailyLoss: number;
    maxDrawdown: number;
  };
}

const SignalSettings: React.FC<SignalSettingsProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SignalSettings>({
    conditions: [],
    defaultCooldown: 60,
    maxActiveSignals: 5,
    riskManagement: {
      maxOpenPositions: 3,
      maxDailyLoss: 5,
      maxDrawdown: 10
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<SignalCondition | null>(null);
  const [formData, setFormData] = useState<Partial<SignalCondition>>({
    name: '',
    type: 'indicator',
    enabled: true,
    conditions: [],
    actions: [],
    cooldown: 60,
    priority: 0
  });

  const [indicators, setIndicators] = useState<string[]>([]);
  const [timeframes, setTimeframes] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchIndicators();
    fetchTimeframes();
  }, [botId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/signal-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch signal settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchIndicators = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/indicators`);
      if (!response.ok) {
        throw new Error('Failed to fetch indicators');
      }

      const data = await response.json();
      setIndicators(data.map((ind: any) => ind.name));
    } catch (err) {
      console.error('Failed to fetch indicators:', err);
    }
  };

  const fetchTimeframes = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/timeframes`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeframes');
      }

      const data = await response.json();
      setTimeframes(data);
    } catch (err) {
      console.error('Failed to fetch timeframes:', err);
    }
  };

  const handleDialogOpen = (condition?: SignalCondition) => {
    if (condition) {
      setEditingCondition(condition);
      setFormData(condition);
    } else {
      setEditingCondition(null);
      setFormData({
        name: '',
        type: 'indicator',
        enabled: true,
        conditions: [],
        actions: [],
        cooldown: 60,
        priority: 0
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCondition(null);
    setFormData({
      name: '',
      type: 'indicator',
      enabled: true,
      conditions: [],
      actions: [],
      cooldown: 60,
      priority: 0
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const handleActionChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        {
          operator: '>',
          value: 0
        }
      ]
    }));
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index)
    }));
  };

  const handleAddAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        {
          type: 'buy',
          params: {}
        }
      ]
    }));
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = editingCondition
        ? `/api/bots/${botId}/signal-settings/conditions/${editingCondition.id}`
        : `/api/bots/${botId}/signal-settings/conditions`;

      const response = await fetch(url, {
        method: editingCondition ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save signal condition');
      }

      setSuccess(editingCondition ? 'Condition updated successfully' : 'Condition added successfully');
      handleDialogClose();
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conditionId: string) => {
    if (!window.confirm('Are you sure you want to delete this signal condition?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/signal-settings/conditions/${conditionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete signal condition');
      }

      setSuccess('Condition deleted successfully');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCondition = async (conditionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/signal-settings/conditions/${conditionId}/test`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to test signal condition');
      }

      setSuccess('Test signal sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUpIcon color="success" />;
      case 'sell':
        return <TrendingDownIcon color="error" />;
      case 'alert':
        return <WarningIcon color="warning" />;
      default:
        return <SignalIcon />;
    }
  };

  if (loading && !settings.conditions.length) {
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
          <SignalIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Signal Settings</Typography>
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
              <Typography variant="subtitle1">Global Settings</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Default Cooldown (seconds)"
                  value={settings.defaultCooldown}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    defaultCooldown: Number(e.target.value)
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Active Signals"
                  value={settings.maxActiveSignals}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    maxActiveSignals: Number(e.target.value)
                  }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Risk Management</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Signal Conditions</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
              >
                Add Condition
              </Button>
            </Box>

            <List>
              {settings.conditions.map((condition) => (
                <ListItem
                  key={condition.id}
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
                        <SignalIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          {condition.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: condition.enabled ? 'success.main' : 'error.main',
                            color: 'white'
                          }}
                        >
                          {condition.enabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {condition.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Priority: {condition.priority}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cooldown: {condition.cooldown} seconds
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Actions: {condition.actions.map(action => action.type).join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Test Condition">
                      <IconButton
                        onClick={() => handleTestCondition(condition.id)}
                        sx={{ mr: 1 }}
                      >
                        <SignalIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleDialogOpen(condition)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(condition.id)}
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
        </Grid>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingCondition ? 'Edit Signal Condition' : 'Add Signal Condition'}
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.enabled}
                        onChange={(e) => handleInputChange('enabled', e.target.checked)}
                      />
                    }
                    label="Enabled"
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
                      <MenuItem value="indicator">Indicator</MenuItem>
                      <MenuItem value="price">Price</MenuItem>
                      <MenuItem value="volume">Volume</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Conditions</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddCondition}
                    >
                      Add Condition
                    </Button>
                  </Box>
                  {formData.conditions?.map((condition, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {formData.type === 'indicator' && (
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                              <InputLabel>Indicator</InputLabel>
                              <Select
                                value={condition.indicator || ''}
                                label="Indicator"
                                onChange={(e) => handleConditionChange(index, 'indicator', e.target.value)}
                              >
                                {indicators.map((indicator) => (
                                  <MenuItem key={indicator} value={indicator}>
                                    {indicator}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={formData.type === 'indicator' ? 3 : 4}>
                          <FormControl fullWidth>
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={condition.operator}
                              label="Operator"
                              onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                            >
                              <MenuItem value=">">Greater Than</MenuItem>
                              <MenuItem value="<">Less Than</MenuItem>
                              <MenuItem value="==">Equal To</MenuItem>
                              <MenuItem value=">=">Greater Than or Equal</MenuItem>
                              <MenuItem value="<=">Less Than or Equal</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={formData.type === 'indicator' ? 3 : 4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Value"
                            value={condition.value}
                            onChange={(e) => handleConditionChange(index, 'value', Number(e.target.value))}
                          />
                        </Grid>
                        {formData.type === 'indicator' && (
                          <Grid item xs={12} sm={2}>
                            <FormControl fullWidth>
                              <InputLabel>Timeframe</InputLabel>
                              <Select
                                value={condition.timeframe || ''}
                                label="Timeframe"
                                onChange={(e) => handleConditionChange(index, 'timeframe', e.target.value)}
                              >
                                {timeframes.map((timeframe) => (
                                  <MenuItem key={timeframe} value={timeframe}>
                                    {timeframe}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={formData.type === 'indicator' ? 0 : 4}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveCondition(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Actions</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddAction}
                    >
                      Add Action
                    </Button>
                  </Box>
                  {formData.actions?.map((action, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Action Type</InputLabel>
                            <Select
                              value={action.type}
                              label="Action Type"
                              onChange={(e) => handleActionChange(index, 'type', e.target.value)}
                            >
                              <MenuItem value="buy">Buy</MenuItem>
                              <MenuItem value="sell">Sell</MenuItem>
                              <MenuItem value="alert">Alert</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        {(action.type === 'buy' || action.type === 'sell') && (
                          <>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Amount"
                                value={action.params?.amount || ''}
                                onChange={(e) => handleActionChange(index, 'params', {
                                  ...action.params,
                                  amount: Number(e.target.value)
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Stop Loss"
                                value={action.params?.stopLoss || ''}
                                onChange={(e) => handleActionChange(index, 'params', {
                                  ...action.params,
                                  stopLoss: Number(e.target.value)
                                })}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Take Profit"
                                value={action.params?.takeProfit || ''}
                                onChange={(e) => handleActionChange(index, 'params', {
                                  ...action.params,
                                  takeProfit: Number(e.target.value)
                                })}
                              />
                            </Grid>
                          </>
                        )}
                        <Grid item xs={12} sm={formData.type === 'indicator' ? 0 : 12}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveAction(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cooldown (seconds)"
                    value={formData.cooldown}
                    onChange={(e) => handleInputChange('cooldown', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
            >
              {editingCondition ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SignalSettings; 