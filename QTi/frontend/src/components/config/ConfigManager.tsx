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
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
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
    email: boolean;
    telegram: boolean;
    discord: boolean;
  };
}

interface ConfigManagerProps {
  configs: BotConfig[];
  onSave: (config: BotConfig) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({
  configs,
  onSave,
  onDelete,
  onDuplicate,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [selectedConfig, setSelectedConfig] = useState<BotConfig | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleConfigSelect = (config: BotConfig) => {
    setSelectedConfig(config);
  };

  const handleSectionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const handleParameterChange = (section: string, field: string, value: any) => {
    if (!selectedConfig) return;

    setSelectedConfig({
      ...selectedConfig,
      [section]: {
        ...selectedConfig[section as keyof BotConfig],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!selectedConfig) return;
    await onSave(selectedConfig);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    if (selectedConfig?.id === id) {
      setSelectedConfig(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    await onDuplicate(id);
  };

  const handleRefresh = async () => {
    await onRefresh();
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Bot Configurations</Typography>
        <Box>
          <Tooltip title="Refresh Configurations">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setSelectedConfig({
              id: '',
              name: '',
              exchange: '',
              symbol: '',
              strategy: '',
              timeframe: '',
              parameters: {},
              riskManagement: {
                maxPositionSize: 0,
                stopLoss: 0,
                takeProfit: 0,
                trailingStop: false,
                trailingStopDistance: 0,
              },
              tradingSchedule: {
                enabled: false,
                startTime: '',
                endTime: '',
                timezone: 'UTC',
              },
              notifications: {
                email: false,
                telegram: false,
                discord: false,
              },
            })}
            disabled={loading}
          >
            New Configuration
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>
              Saved Configurations
            </Typography>
            {configs.map((config) => (
              <Card
                key={config.id}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  bgcolor: selectedConfig?.id === config.id ? 'action.selected' : 'background.paper',
                }}
                onClick={() => handleConfigSelect(config)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">{config.name}</Typography>
                    <Box>
                      <Tooltip title="Duplicate">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(config.id);
                          }}
                        >
                          <DuplicateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(config.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {config.exchange} - {config.symbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Strategy: {config.strategy}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedConfig ? (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedConfig.id ? 'Edit Configuration' : 'New Configuration'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Configuration Name"
                      value={selectedConfig.name}
                      onChange={(e) => setSelectedConfig({ ...selectedConfig, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Exchange</InputLabel>
                      <Select
                        value={selectedConfig.exchange}
                        label="Exchange"
                        onChange={(e) => setSelectedConfig({ ...selectedConfig, exchange: e.target.value })}
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
                      label="Trading Pair"
                      value={selectedConfig.symbol}
                      onChange={(e) => setSelectedConfig({ ...selectedConfig, symbol: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Strategy</InputLabel>
                      <Select
                        value={selectedConfig.strategy}
                        label="Strategy"
                        onChange={(e) => setSelectedConfig({ ...selectedConfig, strategy: e.target.value })}
                      >
                        <MenuItem value="grid">Grid Trading</MenuItem>
                        <MenuItem value="dca">DCA</MenuItem>
                        <MenuItem value="rsi">RSI</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Accordion
                expanded={expandedSection === 'riskManagement'}
                onChange={handleSectionChange('riskManagement')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Risk Management</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Position Size"
                        value={selectedConfig.riskManagement.maxPositionSize}
                        onChange={(e) => handleParameterChange('riskManagement', 'maxPositionSize', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Stop Loss (%)"
                        value={selectedConfig.riskManagement.stopLoss}
                        onChange={(e) => handleParameterChange('riskManagement', 'stopLoss', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Take Profit (%)"
                        value={selectedConfig.riskManagement.takeProfit}
                        onChange={(e) => handleParameterChange('riskManagement', 'takeProfit', Number(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedConfig.riskManagement.trailingStop}
                            onChange={(e) => handleParameterChange('riskManagement', 'trailingStop', e.target.checked)}
                          />
                        }
                        label="Enable Trailing Stop"
                      />
                    </Grid>
                    {selectedConfig.riskManagement.trailingStop && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Trailing Stop Distance (%)"
                          value={selectedConfig.riskManagement.trailingStopDistance}
                          onChange={(e) => handleParameterChange('riskManagement', 'trailingStopDistance', Number(e.target.value))}
                        />
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expandedSection === 'tradingSchedule'}
                onChange={handleSectionChange('tradingSchedule')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Trading Schedule</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedConfig.tradingSchedule.enabled}
                            onChange={(e) => handleParameterChange('tradingSchedule', 'enabled', e.target.checked)}
                          />
                        }
                        label="Enable Trading Schedule"
                      />
                    </Grid>
                    {selectedConfig.tradingSchedule.enabled && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label="Start Time"
                            value={selectedConfig.tradingSchedule.startTime}
                            onChange={(e) => handleParameterChange('tradingSchedule', 'startTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="time"
                            label="End Time"
                            value={selectedConfig.tradingSchedule.endTime}
                            onChange={(e) => handleParameterChange('tradingSchedule', 'endTime', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Timezone</InputLabel>
                            <Select
                              value={selectedConfig.tradingSchedule.timezone}
                              label="Timezone"
                              onChange={(e) => handleParameterChange('tradingSchedule', 'timezone', e.target.value)}
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
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expandedSection === 'notifications'}
                onChange={handleSectionChange('notifications')}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Notifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedConfig.notifications.email}
                            onChange={(e) => handleParameterChange('notifications', 'email', e.target.checked)}
                          />
                        }
                        label="Email Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedConfig.notifications.telegram}
                            onChange={(e) => handleParameterChange('notifications', 'telegram', e.target.checked)}
                          />
                        }
                        label="Telegram Notifications"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedConfig.notifications.discord}
                            onChange={(e) => handleParameterChange('notifications', 'discord', e.target.checked)}
                          />
                        }
                        label="Discord Notifications"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Configuration'}
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Select a configuration to edit or create a new one
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfigManager; 