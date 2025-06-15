import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface Parameter {
  name: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
  description?: string;
}

interface RiskManagement {
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  maxDrawdown: number;
  trailingStop: boolean;
  trailingStopDistance: number;
}

interface TradingSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
  daysOfWeek: string[];
}

interface Notification {
  type: 'email' | 'telegram' | 'webhook';
  enabled: boolean;
  config: {
    [key: string]: string;
  };
}

interface ConfigFormProps {
  initialData?: {
    name: string;
    exchange: string;
    symbol: string;
    strategy: string;
    timeframe: string;
    parameters: Parameter[];
    riskManagement: RiskManagement;
    tradingSchedule: TradingSchedule;
    notifications: Notification[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  initialData,
  onSave,
  onCancel,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    exchange: '',
    symbol: '',
    strategy: '',
    timeframe: '',
    parameters: [],
    riskManagement: {
      maxPositionSize: 0,
      stopLoss: 0,
      takeProfit: 0,
      maxDrawdown: 0,
      trailingStop: false,
      trailingStopDistance: 0,
    },
    tradingSchedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    notifications: [],
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleParameterChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newParameters = [...prev.parameters];
      newParameters[index] = {
        ...newParameters[index],
        [field]: value,
      };
      return {
        ...prev,
        parameters: newParameters,
      };
    });
  };

  const handleAddParameter = () => {
    setFormData((prev) => ({
      ...prev,
      parameters: [
        ...prev.parameters,
        { name: '', value: '', type: 'string' },
      ],
    }));
  };

  const handleRemoveParameter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index),
    }));
  };

  const handleRiskManagementChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [field]: value,
      },
    }));
  };

  const handleTradingScheduleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      tradingSchedule: {
        ...prev.tradingSchedule,
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newNotifications = [...prev.notifications];
      newNotifications[index] = {
        ...newNotifications[index],
        [field]: value,
      };
      return {
        ...prev,
        notifications: newNotifications,
      };
    });
  };

  const handleAddNotification = () => {
    setFormData((prev) => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        {
          type: 'email',
          enabled: true,
          config: {},
        },
      ],
    }));
  };

  const handleRemoveNotification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((_, i) => i !== index),
    }));
  };

  const renderBasicSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Configuration Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Exchange</InputLabel>
          <Select
            value={formData.exchange}
            label="Exchange"
            onChange={(e) => handleChange('exchange', e.target.value)}
          >
            <MenuItem value="binance">Binance</MenuItem>
            <MenuItem value="bybit">Bybit</MenuItem>
            <MenuItem value="okx">OKX</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Symbol"
          value={formData.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Strategy</InputLabel>
          <Select
            value={formData.strategy}
            label="Strategy"
            onChange={(e) => handleChange('strategy', e.target.value)}
          >
            <MenuItem value="grid">Grid Trading</MenuItem>
            <MenuItem value="dca">DCA</MenuItem>
            <MenuItem value="momentum">Momentum</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={formData.timeframe}
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
  );

  const renderParameters = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Strategy Parameters</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddParameter}
          variant="outlined"
        >
          Add Parameter
        </Button>
      </Box>
      {formData.parameters.map((param, index) => (
        <Grid container spacing={2} key={index} alignItems="center" mb={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Parameter Name"
              value={param.name}
              onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={param.type}
                label="Type"
                onChange={(e) => handleParameterChange(index, 'type', e.target.value)}
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">Boolean</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            {param.type === 'boolean' ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={param.value as boolean}
                    onChange={(e) => handleParameterChange(index, 'value', e.target.checked)}
                  />
                }
                label="Enabled"
              />
            ) : (
              <TextField
                fullWidth
                label="Value"
                type={param.type === 'number' ? 'number' : 'text'}
                value={param.value}
                onChange={(e) => handleParameterChange(index, 'value', e.target.value)}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton
              color="error"
              onClick={() => handleRemoveParameter(index)}
            >
              <RemoveIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Box>
  );

  const renderRiskManagement = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Max Position Size"
          type="number"
          value={formData.riskManagement.maxPositionSize}
          onChange={(e) => handleRiskManagementChange('maxPositionSize', Number(e.target.value))}
          InputProps={{
            endAdornment: <Typography variant="body2">%</Typography>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Stop Loss"
          type="number"
          value={formData.riskManagement.stopLoss}
          onChange={(e) => handleRiskManagementChange('stopLoss', Number(e.target.value))}
          InputProps={{
            endAdornment: <Typography variant="body2">%</Typography>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Take Profit"
          type="number"
          value={formData.riskManagement.takeProfit}
          onChange={(e) => handleRiskManagementChange('takeProfit', Number(e.target.value))}
          InputProps={{
            endAdornment: <Typography variant="body2">%</Typography>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Max Drawdown"
          type="number"
          value={formData.riskManagement.maxDrawdown}
          onChange={(e) => handleRiskManagementChange('maxDrawdown', Number(e.target.value))}
          InputProps={{
            endAdornment: <Typography variant="body2">%</Typography>,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.riskManagement.trailingStop}
              onChange={(e) => handleRiskManagementChange('trailingStop', e.target.checked)}
            />
          }
          label="Trailing Stop"
        />
      </Grid>
      {formData.riskManagement.trailingStop && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Trailing Stop Distance"
            type="number"
            value={formData.riskManagement.trailingStopDistance}
            onChange={(e) => handleRiskManagementChange('trailingStopDistance', Number(e.target.value))}
            InputProps={{
              endAdornment: <Typography variant="body2">%</Typography>,
            }}
          />
        </Grid>
      )}
    </Grid>
  );

  const renderTradingSchedule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.tradingSchedule.enabled}
              onChange={(e) => handleTradingScheduleChange('enabled', e.target.checked)}
            />
          }
          label="Enable Trading Schedule"
        />
      </Grid>
      {formData.tradingSchedule.enabled && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={formData.tradingSchedule.startTime}
              onChange={(e) => handleTradingScheduleChange('startTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={formData.tradingSchedule.endTime}
              onChange={(e) => handleTradingScheduleChange('endTime', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={formData.tradingSchedule.timezone}
                label="Timezone"
                onChange={(e) => handleTradingScheduleChange('timezone', e.target.value)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Days of Week</InputLabel>
              <Select
                multiple
                value={formData.tradingSchedule.daysOfWeek}
                label="Days of Week"
                onChange={(e) => handleTradingScheduleChange('daysOfWeek', e.target.value)}
              >
                <MenuItem value="Monday">Monday</MenuItem>
                <MenuItem value="Tuesday">Tuesday</MenuItem>
                <MenuItem value="Wednesday">Wednesday</MenuItem>
                <MenuItem value="Thursday">Thursday</MenuItem>
                <MenuItem value="Friday">Friday</MenuItem>
                <MenuItem value="Saturday">Saturday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderNotifications = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Notifications</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddNotification}
          variant="outlined"
        >
          Add Notification
        </Button>
      </Box>
      {formData.notifications.map((notification, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={notification.type}
                  label="Type"
                  onChange={(e) => handleNotificationChange(index, 'type', e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="webhook">Webhook</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notification.enabled}
                    onChange={(e) => handleNotificationChange(index, 'enabled', e.target.checked)}
                  />
                }
                label="Enabled"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              {notification.type === 'email' && (
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={notification.config.email || ''}
                  onChange={(e) => handleNotificationChange(index, 'config', {
                    ...notification.config,
                    email: e.target.value,
                  })}
                />
              )}
              {notification.type === 'telegram' && (
                <TextField
                  fullWidth
                  label="Telegram Chat ID"
                  value={notification.config.chatId || ''}
                  onChange={(e) => handleNotificationChange(index, 'config', {
                    ...notification.config,
                    chatId: e.target.value,
                  })}
                />
              )}
              {notification.type === 'webhook' && (
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={notification.config.url || ''}
                  onChange={(e) => handleNotificationChange(index, 'config', {
                    ...notification.config,
                    url: e.target.value,
                  })}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton
                color="error"
                onClick={() => handleRemoveNotification(index)}
              >
                <RemoveIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {initialData ? 'Edit Configuration' : 'New Configuration'}
        </Typography>
        <Box>
          <Tooltip title="Help">
            <IconButton onClick={() => setShowHelp(!showHelp)}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={showHelp}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Configuration Help
          </Typography>
          <Typography variant="body2">
            • Basic Settings: Configure the basic parameters of your trading bot.
            <br />
            • Strategy Parameters: Set up the specific parameters for your chosen strategy.
            <br />
            • Risk Management: Define your risk management rules and limits.
            <br />
            • Trading Schedule: Set when your bot should be active.
            <br />
            • Notifications: Configure how you want to be notified about bot activities.
          </Typography>
        </Alert>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box mb={3}>
        <Button
          variant={activeTab === 'basic' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('basic')}
          sx={{ mr: 1 }}
        >
          Basic Settings
        </Button>
        <Button
          variant={activeTab === 'parameters' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('parameters')}
          sx={{ mr: 1 }}
        >
          Parameters
        </Button>
        <Button
          variant={activeTab === 'risk' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('risk')}
          sx={{ mr: 1 }}
        >
          Risk Management
        </Button>
        <Button
          variant={activeTab === 'schedule' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('schedule')}
          sx={{ mr: 1 }}
        >
          Trading Schedule
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {activeTab === 'basic' && renderBasicSettings()}
      {activeTab === 'parameters' && renderParameters()}
      {activeTab === 'risk' && renderRiskManagement()}
      {activeTab === 'schedule' && renderTradingSchedule()}
      {activeTab === 'notifications' && renderNotifications()}

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(formData)}
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ConfigForm; 