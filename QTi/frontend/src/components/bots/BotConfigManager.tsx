import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

interface BotConfig {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  parameters: {
    [key: string]: any;
  };
  riskManagement: {
    maxDrawdown: number;
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
  };
  schedule: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
    days?: string[];
  };
  notifications: {
    email: boolean;
    telegram: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
}

interface BotConfigManagerProps {
  configs: BotConfig[];
  onAddConfig: (config: Omit<BotConfig, 'id'>) => Promise<void>;
  onEditConfig: (id: string, config: Omit<BotConfig, 'id'>) => Promise<void>;
  onDeleteConfig: (id: string) => Promise<void>;
  onDuplicateConfig: (id: string) => Promise<void>;
  onExportConfig: (id: string) => Promise<void>;
  onImportConfig: (file: File) => Promise<void>;
}

const BotConfigManager: React.FC<BotConfigManagerProps> = ({
  configs,
  onAddConfig,
  onEditConfig,
  onDeleteConfig,
  onDuplicateConfig,
  onExportConfig,
  onImportConfig,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BotConfig | null>(null);
  const [formData, setFormData] = useState<Omit<BotConfig, 'id'>>({
    name: '',
    exchange: '',
    symbol: '',
    strategy: '',
    parameters: {},
    riskManagement: {
      maxDrawdown: 20,
      stopLoss: 5,
      takeProfit: 10,
      positionSize: 100,
    },
    schedule: {
      enabled: false,
    },
    notifications: {
      email: false,
      telegram: false,
      webhook: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | false>(false);

  const handleOpenDialog = (config?: BotConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        exchange: config.exchange,
        symbol: config.symbol,
        strategy: config.strategy,
        parameters: config.parameters,
        riskManagement: config.riskManagement,
        schedule: config.schedule,
        notifications: config.notifications,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        exchange: '',
        symbol: '',
        strategy: '',
        parameters: {},
        riskManagement: {
          maxDrawdown: 20,
          stopLoss: 5,
          takeProfit: 10,
          positionSize: 100,
        },
        schedule: {
          enabled: false,
        },
        notifications: {
          email: false,
          telegram: false,
          webhook: false,
        },
      });
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      if (editingConfig) {
        await onEditConfig(editingConfig.id, formData);
      } else {
        await onAddConfig(formData);
      }
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      setError(null);
      await onImportConfig(file);
    } catch (err) {
      setError('Failed to import configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Bot Configurations</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            accept=".json,.yaml,.yml"
            style={{ display: 'none' }}
            id="config-upload"
            onChange={handleFileUpload}
          />
          <label htmlFor="config-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
            >
              Import
            </Button>
          </label>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Configuration
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {configs.map((config) => (
          <ListItem
            key={config.id}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <ListItemText
              primary={config.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {config.exchange} - {config.symbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Strategy: {config.strategy}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Duplicate Configuration">
                  <IconButton
                    edge="end"
                    onClick={() => onDuplicateConfig(config.id)}
                    sx={{ mr: 1 }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Configuration">
                  <IconButton
                    edge="end"
                    onClick={() => onExportConfig(config.id)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Configuration">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(config)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Configuration">
                  <IconButton
                    edge="end"
                    onClick={() => onDeleteConfig(config.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Accordion
              expanded={expandedSection === 'basic'}
              onChange={handleSectionChange('basic')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Basic Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Configuration Name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Exchange</InputLabel>
                      <Select
                        value={formData.exchange}
                        label="Exchange"
                        onChange={(e) => setFormData((prev) => ({ ...prev, exchange: e.target.value }))}
                      >
                        <MenuItem value="binance">Binance</MenuItem>
                        <MenuItem value="bybit">Bybit</MenuItem>
                        <MenuItem value="okx">OKX</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Strategy</InputLabel>
                      <Select
                        value={formData.strategy}
                        label="Strategy"
                        onChange={(e) => setFormData((prev) => ({ ...prev, strategy: e.target.value }))}
                      >
                        <MenuItem value="grid">Grid Trading</MenuItem>
                        <MenuItem value="dca">DCA</MenuItem>
                        <MenuItem value="momentum">Momentum</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedSection === 'risk'}
              onChange={handleSectionChange('risk')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Risk Management</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Max Drawdown (%)"
                      type="number"
                      value={formData.riskManagement.maxDrawdown}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            maxDrawdown: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Stop Loss (%)"
                      type="number"
                      value={formData.riskManagement.stopLoss}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            stopLoss: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Take Profit (%)"
                      type="number"
                      value={formData.riskManagement.takeProfit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            takeProfit: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Position Size (%)"
                      type="number"
                      value={formData.riskManagement.positionSize}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            positionSize: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedSection === 'schedule'}
              onChange={handleSectionChange('schedule')}
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
                          checked={formData.schedule.enabled}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule,
                                enabled: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Enable Schedule"
                    />
                  </Grid>
                  {formData.schedule.enabled && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={formData.schedule.startTime || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule,
                                startTime: e.target.value,
                              },
                            }))
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="End Time"
                          type="time"
                          value={formData.schedule.endTime || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              schedule: {
                                ...prev.schedule,
                                endTime: e.target.value,
                              },
                            }))
                          }
                          fullWidth
                        />
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
                          checked={formData.notifications.email}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                email: e.target.checked,
                              },
                            }))
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
                          checked={formData.notifications.telegram}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                telegram: e.target.checked,
                              },
                            }))
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
                          checked={formData.notifications.webhook}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                webhook: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label="Webhook Notifications"
                    />
                  </Grid>
                  {formData.notifications.webhook && (
                    <Grid item xs={12}>
                      <TextField
                        label="Webhook URL"
                        value={formData.notifications.webhookUrl || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              webhookUrl: e.target.value,
                            },
                          }))
                        }
                        fullWidth
                      />
                    </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={loading || !formData.name || !formData.exchange || !formData.symbol || !formData.strategy}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotConfigManager; 