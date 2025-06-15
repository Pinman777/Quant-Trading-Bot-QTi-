import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
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
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
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
    maxDrawdown: number;
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
    daysOfWeek: number[];
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    events: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface BotConfigManagerProps {
  onAdd?: (config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEdit?: (id: string, config: Partial<BotConfig>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const BotConfigManager: React.FC<BotConfigManagerProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [configs, setConfigs] = useState<BotConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<BotConfig | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newConfig, setNewConfig] = useState<Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    exchange: 'binance',
    symbol: '',
    strategy: 'grid',
    timeframe: '1h',
    parameters: {},
    riskManagement: {
      maxPositionSize: 100,
      maxDrawdown: 10,
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
      daysOfWeek: [1, 2, 3, 4, 5],
    },
    notifications: {
      enabled: true,
      channels: ['email'],
      events: ['trade', 'error'],
    },
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/configs');
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      const data = await response.json();
      setConfigs(data);
    } catch (err) {
      console.error('Error fetching configurations:', err);
    }
  };

  const handleAdd = async () => {
    if (onAdd) {
      await onAdd(newConfig);
      setIsAddDialogOpen(false);
      setNewConfig({
        name: '',
        exchange: 'binance',
        symbol: '',
        strategy: 'grid',
        timeframe: '1h',
        parameters: {},
        riskManagement: {
          maxPositionSize: 100,
          maxDrawdown: 10,
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
          daysOfWeek: [1, 2, 3, 4, 5],
        },
        notifications: {
          enabled: true,
          channels: ['email'],
          events: ['trade', 'error'],
        },
      });
      fetchConfigs();
    }
  };

  const handleEdit = async () => {
    if (selectedConfig && onEdit) {
      await onEdit(selectedConfig.id, selectedConfig);
      setIsEditDialogOpen(false);
      setSelectedConfig(null);
      fetchConfigs();
    }
  };

  const handleDelete = async () => {
    if (selectedConfig && onDelete) {
      await onDelete(selectedConfig.id);
      setIsDeleteDialogOpen(false);
      setSelectedConfig(null);
      fetchConfigs();
    }
  };

  const handleDuplicate = async (id: string) => {
    if (onDuplicate) {
      await onDuplicate(id);
      fetchConfigs();
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
    fetchConfigs();
  };

  const renderConfigCard = (config: BotConfig) => (
    <Card key={config.id}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {config.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={config.exchange} size="small" />
              <Chip label={config.symbol} size="small" />
              <Chip label={config.strategy} size="small" />
              <Chip label={config.timeframe} size="small" />
            </Box>
          </Box>
          <Box>
            <Tooltip title="Duplicate">
              <IconButton size="small" onClick={() => handleDuplicate(config.id)}>
                <DuplicateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedConfig(config);
                  setIsEditDialogOpen(true);
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedConfig(config);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Risk Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Max Position: ${config.riskManagement.maxPositionSize}%`}
                size="small"
              />
              <Chip
                label={`Max Drawdown: ${config.riskManagement.maxDrawdown}%`}
                size="small"
              />
              <Chip
                label={`Stop Loss: ${config.riskManagement.stopLoss}%`}
                size="small"
              />
              <Chip
                label={`Take Profit: ${config.riskManagement.takeProfit}%`}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Trading Schedule
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {config.tradingSchedule.enabled ? (
                <>
                  <Chip
                    label={`${config.tradingSchedule.startTime} - ${config.tradingSchedule.endTime}`}
                    size="small"
                  />
                  <Chip label={config.tradingSchedule.timezone} size="small" />
                </>
              ) : (
                <Chip label="24/7" size="small" />
              )}
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Last Updated: {new Date(config.updatedAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderConfigForm = (config: Partial<BotConfig>, onChange: (config: Partial<BotConfig>) => void) => (
    <Box>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
        <Tab label="Basic" />
        <Tab label="Risk Management" />
        <Tab label="Trading Schedule" />
        <Tab label="Notifications" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <TextField
            fullWidth
            label="Name"
            value={config.name || ''}
            onChange={(e) => onChange({ ...config, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Exchange</InputLabel>
            <Select
              value={config.exchange || 'binance'}
              label="Exchange"
              onChange={(e) => onChange({ ...config, exchange: e.target.value })}
            >
              <MenuItem value="binance">Binance</MenuItem>
              <MenuItem value="bybit">Bybit</MenuItem>
              <MenuItem value="okx">OKX</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Symbol"
            value={config.symbol || ''}
            onChange={(e) => onChange({ ...config, symbol: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Strategy</InputLabel>
            <Select
              value={config.strategy || 'grid'}
              label="Strategy"
              onChange={(e) => onChange({ ...config, strategy: e.target.value })}
            >
              <MenuItem value="grid">Grid</MenuItem>
              <MenuItem value="dca">DCA</MenuItem>
              <MenuItem value="scalping">Scalping</MenuItem>
              <MenuItem value="swing">Swing</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={config.timeframe || '1h'}
              label="Timeframe"
              onChange={(e) => onChange({ ...config, timeframe: e.target.value })}
            >
              <MenuItem value="1m">1 minute</MenuItem>
              <MenuItem value="5m">5 minutes</MenuItem>
              <MenuItem value="15m">15 minutes</MenuItem>
              <MenuItem value="1h">1 hour</MenuItem>
              <MenuItem value="4h">4 hours</MenuItem>
              <MenuItem value="1d">1 day</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <TextField
            fullWidth
            type="number"
            label="Max Position Size (%)"
            value={config.riskManagement?.maxPositionSize || 100}
            onChange={(e) =>
              onChange({
                ...config,
                riskManagement: {
                  ...config.riskManagement,
                  maxPositionSize: Number(e.target.value),
                },
              })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Max Drawdown (%)"
            value={config.riskManagement?.maxDrawdown || 10}
            onChange={(e) =>
              onChange({
                ...config,
                riskManagement: {
                  ...config.riskManagement,
                  maxDrawdown: Number(e.target.value),
                },
              })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Stop Loss (%)"
            value={config.riskManagement?.stopLoss || 5}
            onChange={(e) =>
              onChange({
                ...config,
                riskManagement: {
                  ...config.riskManagement,
                  stopLoss: Number(e.target.value),
                },
              })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Take Profit (%)"
            value={config.riskManagement?.takeProfit || 10}
            onChange={(e) =>
              onChange({
                ...config,
                riskManagement: {
                  ...config.riskManagement,
                  takeProfit: Number(e.target.value),
                },
              })
            }
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.riskManagement?.trailingStop || false}
                onChange={(e) =>
                  onChange({
                    ...config,
                    riskManagement: {
                      ...config.riskManagement,
                      trailingStop: e.target.checked,
                    },
                  })
                }
              }
              label="Trailing Stop"
            }
          />

          {config.riskManagement?.trailingStop && (
            <TextField
              fullWidth
              type="number"
              label="Trailing Stop Distance (%)"
              value={config.riskManagement?.trailingStopDistance || 2}
              onChange={(e) =>
                onChange({
                  ...config,
                  riskManagement: {
                    ...config.riskManagement,
                    trailingStopDistance: Number(e.target.value),
                  },
                })
              }
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={config.tradingSchedule?.enabled || false}
                onChange={(e) =>
                  onChange({
                    ...config,
                    tradingSchedule: {
                      ...config.tradingSchedule,
                      enabled: e.target.checked,
                    },
                  })
                }
              }
              label="Enable Trading Schedule"
            }
          />

          {config.tradingSchedule?.enabled && (
            <>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={config.tradingSchedule?.startTime || '00:00'}
                onChange={(e) =>
                  onChange({
                    ...config,
                    tradingSchedule: {
                      ...config.tradingSchedule,
                      startTime: e.target.value,
                    },
                  })
                }
                sx={{ mt: 2, mb: 2 }}
              />

              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={config.tradingSchedule?.endTime || '23:59'}
                onChange={(e) =>
                  onChange({
                    ...config,
                    tradingSchedule: {
                      ...config.tradingSchedule,
                      endTime: e.target.value,
                    },
                  })
                }
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={config.tradingSchedule?.timezone || 'UTC'}
                  label="Timezone"
                  onChange={(e) =>
                    onChange({
                      ...config,
                      tradingSchedule: {
                        ...config.tradingSchedule,
                        timezone: e.target.value,
                      },
                    })
                  }
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                  <MenuItem value="GMT">GMT</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={config.notifications?.enabled || false}
                onChange={(e) =>
                  onChange({
                    ...config,
                    notifications: {
                      ...config.notifications,
                      enabled: e.target.checked,
                    },
                  })
                }
              }
              label="Enable Notifications"
            }
          />

          {config.notifications?.enabled && (
            <>
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Channels</InputLabel>
                <Select
                  multiple
                  value={config.notifications?.channels || []}
                  label="Channels"
                  onChange={(e) =>
                    onChange({
                      ...config,
                      notifications: {
                        ...config.notifications,
                        channels: e.target.value as string[],
                      },
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="webhook">Webhook</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Events</InputLabel>
                <Select
                  multiple
                  value={config.notifications?.events || []}
                  label="Events"
                  onChange={(e) =>
                    onChange({
                      ...config,
                      notifications: {
                        ...config.notifications,
                        events: e.target.value as string[],
                      },
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="trade">Trade</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="profit">Profit</MenuItem>
                  <MenuItem value="loss">Loss</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Bot Configurations</Typography>
        <Box>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Add Configuration
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {configs.map(renderConfigCard)}
        </Grid>
      )}

      {/* Add Configuration Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Configuration</DialogTitle>
        <DialogContent>
          {renderConfigForm(newConfig, setNewConfig)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Configuration Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Configuration</DialogTitle>
        <DialogContent>
          {selectedConfig && renderConfigForm(selectedConfig, setSelectedConfig)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this configuration? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotConfigManager; 