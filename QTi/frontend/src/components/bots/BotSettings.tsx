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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface BotSettings {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  riskManagement: {
    maxDrawdown: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  tradingSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  notifications: {
    email: boolean;
    telegram: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
  advancedSettings: {
    [key: string]: any;
  };
}

interface BotSettingsProps {
  settings: BotSettings;
  onSave: (settings: BotSettings) => Promise<void>;
  onReset: () => void;
}

const BotSettings: React.FC<BotSettingsProps> = ({
  settings,
  onSave,
  onReset,
}) => {
  const [editedSettings, setEditedSettings] = useState<BotSettings>(settings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (section: string, field: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BotSettings],
        [field]: value,
      },
    }));
  };

  const handleAdvancedSettingChange = (key: string, value: any) => {
    setEditedSettings((prev) => ({
      ...prev,
      advancedSettings: {
        ...prev.advancedSettings,
        [key]: value,
      },
    }));
  };

  const handleAddAdvancedSetting = () => {
    const key = prompt('Enter setting key:');
    if (key) {
      const value = prompt('Enter setting value:');
      if (value !== null) {
        handleAdvancedSettingChange(key, value);
      }
    }
  };

  const handleRemoveAdvancedSetting = (key: string) => {
    setEditedSettings((prev) => {
      const newAdvancedSettings = { ...prev.advancedSettings };
      delete newAdvancedSettings[key];
      return {
        ...prev,
        advancedSettings: newAdvancedSettings,
      };
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await onSave(editedSettings);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEditedSettings(settings);
    onReset();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Bot Settings</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            Save
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
              Basic Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bot Name"
                  value={editedSettings.name}
                  onChange={(e) => handleChange('name', 'name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Exchange</InputLabel>
                  <Select
                    value={editedSettings.exchange}
                    label="Exchange"
                    onChange={(e) => handleChange('exchange', 'exchange', e.target.value)}
                  >
                    <MenuItem value="binance">Binance</MenuItem>
                    <MenuItem value="bybit">Bybit</MenuItem>
                    <MenuItem value="kucoin">KuCoin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Symbol"
                  value={editedSettings.symbol}
                  onChange={(e) => handleChange('symbol', 'symbol', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={editedSettings.strategy}
                    label="Strategy"
                    onChange={(e) => handleChange('strategy', 'strategy', e.target.value)}
                  >
                    <MenuItem value="grid">Grid Trading</MenuItem>
                    <MenuItem value="dca">DCA</MenuItem>
                    <MenuItem value="momentum">Momentum</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Drawdown (%)"
                  value={editedSettings.riskManagement.maxDrawdown}
                  onChange={(e) =>
                    handleChange('riskManagement', 'maxDrawdown', parseFloat(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stop Loss (%)"
                  value={editedSettings.riskManagement.stopLoss}
                  onChange={(e) =>
                    handleChange('riskManagement', 'stopLoss', parseFloat(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Take Profit (%)"
                  value={editedSettings.riskManagement.takeProfit}
                  onChange={(e) =>
                    handleChange('riskManagement', 'takeProfit', parseFloat(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Position Size (%)"
                  value={editedSettings.riskManagement.positionSize}
                  onChange={(e) =>
                    handleChange('riskManagement', 'positionSize', parseFloat(e.target.value))
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Trading Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.tradingSchedule.enabled}
                      onChange={(e) =>
                        handleChange('tradingSchedule', 'enabled', e.target.checked)
                      }
                    />
                  }
                  label="Enable Trading Schedule"
                />
              </Grid>
              {editedSettings.tradingSchedule.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time"
                      value={editedSettings.tradingSchedule.startTime}
                      onChange={(e) =>
                        handleChange('tradingSchedule', 'startTime', e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time"
                      value={editedSettings.tradingSchedule.endTime}
                      onChange={(e) =>
                        handleChange('tradingSchedule', 'endTime', e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={editedSettings.tradingSchedule.timezone}
                        label="Timezone"
                        onChange={(e) =>
                          handleChange('tradingSchedule', 'timezone', e.target.value)
                        }
                      >
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="EST">EST</MenuItem>
                        <MenuItem value="PST">PST</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Notifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.notifications.email}
                      onChange={(e) =>
                        handleChange('notifications', 'email', e.target.checked)
                      }
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.notifications.telegram}
                      onChange={(e) =>
                        handleChange('notifications', 'telegram', e.target.checked)
                      }
                    />
                  }
                  label="Telegram Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedSettings.notifications.webhook}
                      onChange={(e) =>
                        handleChange('notifications', 'webhook', e.target.checked)
                      }
                    />
                  }
                  label="Webhook Notifications"
                />
              </Grid>
              {editedSettings.notifications.webhook && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    value={editedSettings.notifications.webhookUrl || ''}
                    onChange={(e) =>
                      handleChange('notifications', 'webhookUrl', e.target.value)
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddAdvancedSetting}
                >
                  Add Setting
                </Button>
              </Box>
              <Grid container spacing={2}>
                {Object.entries(editedSettings.advancedSettings).map(([key, value]) => (
                  <Grid item xs={12} md={6} key={key}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        label={key}
                        value={value}
                        onChange={(e) => handleAdvancedSettingChange(key, e.target.value)}
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveAdvancedSetting(key)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BotSettings; 