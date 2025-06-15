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
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface BotConfig {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  parameters: {
    [key: string]: any;
  };
  riskManagement: {
    maxPositionSize: number;
    stopLoss: number;
    takeProfit: number;
    trailingStop: boolean;
    trailingStopDistance: number;
  };
  tradingSchedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  notifications: {
    enabled: boolean;
    email: string;
    telegram: string;
    discord: string;
  };
}

interface BotConfigEditorProps {
  config?: BotConfig;
  onSave: (config: BotConfig) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onDuplicate?: (config: BotConfig) => Promise<void>;
  loading?: boolean;
  error?: string;
}

const STRATEGIES = [
  { id: 'grid', name: 'Grid Trading' },
  { id: 'dca', name: 'DCA' },
  { id: 'rsi', name: 'RSI' },
  { id: 'macd', name: 'MACD' },
  { id: 'bollinger', name: 'Bollinger Bands' },
];

const EXCHANGES = [
  { id: 'binance', name: 'Binance' },
  { id: 'bybit', name: 'Bybit' },
  { id: 'okx', name: 'OKX' },
];

const TIMEFRAMES = [
  { id: '1m', name: '1 minute' },
  { id: '5m', name: '5 minutes' },
  { id: '15m', name: '15 minutes' },
  { id: '1h', name: '1 hour' },
  { id: '4h', name: '4 hours' },
  { id: '1d', name: '1 day' },
];

const TIMEZONES = [
  { id: 'UTC', name: 'UTC' },
  { id: 'EST', name: 'Eastern Time' },
  { id: 'PST', name: 'Pacific Time' },
  { id: 'GMT', name: 'Greenwich Mean Time' },
];

const BotConfigEditor: React.FC<BotConfigEditorProps> = ({
  config,
  onSave,
  onDelete,
  onDuplicate,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<BotConfig>(
    config || {
      id: '',
      name: '',
      exchange: '',
      symbol: '',
      strategy: '',
      timeframe: '',
      parameters: {},
      riskManagement: {
        maxPositionSize: 1000,
        stopLoss: 5,
        takeProfit: 10,
        trailingStop: false,
        trailingStopDistance: 2,
      },
      tradingSchedule: {
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
        timezone: 'UTC',
      },
      notifications: {
        enabled: false,
        email: '',
        telegram: '',
        discord: '',
      },
    }
  );

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BotConfig],
        [field]: value,
      },
    }));
  };

  const handleParameterChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save configuration:', err);
    }
  };

  const handleDelete = async () => {
    if (onDelete && formData.id) {
      try {
        await onDelete(formData.id);
      } catch (err) {
        console.error('Failed to delete configuration:', err);
      }
    }
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      try {
        await onDuplicate(formData);
      } catch (err) {
        console.error('Failed to duplicate configuration:', err);
      }
    }
  };

  const renderStrategyParameters = () => {
    switch (formData.strategy) {
      case 'grid':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grid Size"
                type="number"
                value={formData.parameters.gridSize || ''}
                onChange={(e) => handleParameterChange('gridSize', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Grid Spacing (%)"
                type="number"
                value={formData.parameters.gridSpacing || ''}
                onChange={(e) => handleParameterChange('gridSpacing', Number(e.target.value))}
              />
            </Grid>
          </Grid>
        );
      case 'dca':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DCA Levels"
                type="number"
                value={formData.parameters.dcaLevels || ''}
                onChange={(e) => handleParameterChange('dcaLevels', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="DCA Amount (%)"
                type="number"
                value={formData.parameters.dcaAmount || ''}
                onChange={(e) => handleParameterChange('dcaAmount', Number(e.target.value))}
              />
            </Grid>
          </Grid>
        );
      case 'rsi':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RSI Period"
                type="number"
                value={formData.parameters.rsiPeriod || ''}
                onChange={(e) => handleParameterChange('rsiPeriod', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="RSI Threshold"
                type="number"
                value={formData.parameters.rsiThreshold || ''}
                onChange={(e) => handleParameterChange('rsiThreshold', Number(e.target.value))}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Bot Configuration</Typography>
        <Box>
          <Tooltip title="Save">
            <IconButton onClick={handleSave} disabled={loading} sx={{ mr: 1 }}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {onDuplicate && (
            <Tooltip title="Duplicate">
              <IconButton onClick={handleDuplicate} disabled={loading} sx={{ mr: 1 }}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete} disabled={loading} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Configuration Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Exchange</InputLabel>
            <Select
              value={formData.exchange}
              label="Exchange"
              onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
            >
              {EXCHANGES.map((exchange) => (
                <MenuItem key={exchange.id} value={exchange.id}>
                  {exchange.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Trading Pair"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="BTC/USDT"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={formData.strategy}
              label="Strategy"
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
            >
              {STRATEGIES.map((strategy) => (
                <MenuItem key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={formData.timeframe}
              label="Timeframe"
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
            >
              {TIMEFRAMES.map((timeframe) => (
                <MenuItem key={timeframe.id} value={timeframe.id}>
                  {timeframe.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Strategy Parameters</Typography>
        </AccordionSummary>
        <AccordionDetails>{renderStrategyParameters()}</AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Risk Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Position Size"
                type="number"
                value={formData.riskManagement.maxPositionSize}
                onChange={(e) =>
                  handleChange('riskManagement', 'maxPositionSize', Number(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stop Loss (%)"
                type="number"
                value={formData.riskManagement.stopLoss}
                onChange={(e) =>
                  handleChange('riskManagement', 'stopLoss', Number(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Take Profit (%)"
                type="number"
                value={formData.riskManagement.takeProfit}
                onChange={(e) =>
                  handleChange('riskManagement', 'takeProfit', Number(e.target.value))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.riskManagement.trailingStop}
                    onChange={(e) =>
                      handleChange('riskManagement', 'trailingStop', e.target.checked)
                    }
                  />
                }
                label="Trailing Stop"
              />
            </Grid>
            {formData.riskManagement.trailingStop && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Trailing Stop Distance (%)"
                  type="number"
                  value={formData.riskManagement.trailingStopDistance}
                  onChange={(e) =>
                    handleChange('riskManagement', 'trailingStopDistance', Number(e.target.value))
                  }
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Trading Schedule</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.tradingSchedule.enabled}
                    onChange={(e) =>
                      handleChange('tradingSchedule', 'enabled', e.target.checked)
                    }
                  />
                }
                label="Enable Trading Schedule"
              />
            </Grid>
            {formData.tradingSchedule.enabled && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={formData.tradingSchedule.startTime}
                    onChange={(e) =>
                      handleChange('tradingSchedule', 'startTime', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={formData.tradingSchedule.endTime}
                    onChange={(e) =>
                      handleChange('tradingSchedule', 'endTime', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={formData.tradingSchedule.timezone}
                      label="Timezone"
                      onChange={(e) =>
                        handleChange('tradingSchedule', 'timezone', e.target.value)
                      }
                    >
                      {TIMEZONES.map((timezone) => (
                        <MenuItem key={timezone.id} value={timezone.id}>
                          {timezone.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Notifications</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.enabled}
                    onChange={(e) =>
                      handleChange('notifications', 'enabled', e.target.checked)
                    }
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
            {formData.notifications.enabled && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.notifications.email}
                    onChange={(e) =>
                      handleChange('notifications', 'email', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Telegram"
                    value={formData.notifications.telegram}
                    onChange={(e) =>
                      handleChange('notifications', 'telegram', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Discord Webhook"
                    value={formData.notifications.discord}
                    onChange={(e) =>
                      handleChange('notifications', 'discord', e.target.value)
                    }
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default BotConfigEditor; 