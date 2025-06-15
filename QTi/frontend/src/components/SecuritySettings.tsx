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
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface SecuritySettingsProps {
  botId: string;
}

interface SecurityConfig {
  twoFactorAuth: {
    enabled: boolean;
    method: 'email' | 'authenticator' | 'sms';
    email?: string;
    phone?: string;
  };
  ipWhitelist: {
    enabled: boolean;
    ips: string[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  apiKeyManagement: {
    requireIpRestriction: boolean;
    requireExpiration: boolean;
    maxKeys: number;
    keyExpirationDays: number;
  };
  emergencyStop: {
    enabled: boolean;
    conditions: {
      maxDailyLoss: number;
      maxDrawdown: number;
      maxOpenPositions: number;
      maxLeverage: number;
    };
    actions: {
      closeAllPositions: boolean;
      cancelAllOrders: boolean;
      disableTrading: boolean;
      notifyAdmin: boolean;
    };
  };
  securityNotifications: {
    enabled: boolean;
    channels: {
      email: boolean;
      telegram: boolean;
      webhook: boolean;
    };
    events: {
      loginAttempt: boolean;
      apiKeyCreated: boolean;
      apiKeyDeleted: boolean;
      settingsChanged: boolean;
      emergencyStop: boolean;
    };
  };
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<SecurityConfig>({
    twoFactorAuth: {
      enabled: false,
      method: 'email'
    },
    ipWhitelist: {
      enabled: false,
      ips: []
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90
    },
    apiKeyManagement: {
      requireIpRestriction: true,
      requireExpiration: true,
      maxKeys: 5,
      keyExpirationDays: 90
    },
    emergencyStop: {
      enabled: false,
      conditions: {
        maxDailyLoss: 10,
        maxDrawdown: 20,
        maxOpenPositions: 5,
        maxLeverage: 3
      },
      actions: {
        closeAllPositions: true,
        cancelAllOrders: true,
        disableTrading: true,
        notifyAdmin: true
      }
    },
    securityNotifications: {
      enabled: true,
      channels: {
        email: true,
        telegram: false,
        webhook: false
      },
      events: {
        loginAttempt: true,
        apiKeyCreated: true,
        apiKeyDeleted: true,
        settingsChanged: true,
        emergencyStop: true
      }
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIp, setNewIp] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [botId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/security-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch security settings');
      }

      const data = await response.json();
      setConfig(data);
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

      const response = await fetch(`/api/bots/${botId}/security-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save security settings');
      }

      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIp = () => {
    if (!newIp) return;

    setConfig(prev => ({
      ...prev,
      ipWhitelist: {
        ...prev.ipWhitelist,
        ips: [...prev.ipWhitelist.ips, newIp]
      }
    }));
    setNewIp('');
    setDialogOpen(false);
  };

  const handleRemoveIp = (ip: string) => {
    setConfig(prev => ({
      ...prev,
      ipWhitelist: {
        ...prev.ipWhitelist,
        ips: prev.ipWhitelist.ips.filter(i => i !== ip)
      }
    }));
  };

  if (loading && !config.twoFactorAuth) {
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
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Security Settings</Typography>
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
              <Typography variant="subtitle1">Two-Factor Authentication</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.twoFactorAuth.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        twoFactorAuth: {
                          ...prev.twoFactorAuth,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable 2FA"
                />
              </Grid>
              {config.twoFactorAuth.enabled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>2FA Method</InputLabel>
                      <Select
                        value={config.twoFactorAuth.method}
                        label="2FA Method"
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          twoFactorAuth: {
                            ...prev.twoFactorAuth,
                            method: e.target.value as 'email' | 'authenticator' | 'sms'
                          }
                        }))}
                      >
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="authenticator">Authenticator App</MenuItem>
                        <MenuItem value="sms">SMS</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {config.twoFactorAuth.method === 'email' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={config.twoFactorAuth.email}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          twoFactorAuth: {
                            ...prev.twoFactorAuth,
                            email: e.target.value
                          }
                        }))}
                      />
                    </Grid>
                  )}
                  {config.twoFactorAuth.method === 'sms' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={config.twoFactorAuth.phone}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          twoFactorAuth: {
                            ...prev.twoFactorAuth,
                            phone: e.target.value
                          }
                        }))}
                      />
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">IP Whitelist</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Add IP
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.ipWhitelist.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        ipWhitelist: {
                          ...prev.ipWhitelist,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable IP Whitelist"
                />
              </Grid>
              {config.ipWhitelist.enabled && (
                <Grid item xs={12}>
                  <List>
                    {config.ipWhitelist.ips.map((ip) => (
                      <ListItem
                        key={ip}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText primary={ip} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveIp(ip)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Password Policy</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Length"
                  value={config.passwordPolicy.minLength}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    passwordPolicy: {
                      ...prev.passwordPolicy,
                      minLength: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 8 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Expiration (days)"
                  value={config.passwordPolicy.expirationDays}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    passwordPolicy: {
                      ...prev.passwordPolicy,
                      expirationDays: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 30 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.passwordPolicy.requireUppercase}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireUppercase: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require Uppercase"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.passwordPolicy.requireLowercase}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireLowercase: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require Lowercase"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.passwordPolicy.requireNumbers}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireNumbers: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require Numbers"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.passwordPolicy.requireSpecialChars}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        passwordPolicy: {
                          ...prev.passwordPolicy,
                          requireSpecialChars: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require Special Characters"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">API Key Management</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.apiKeyManagement.requireIpRestriction}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        apiKeyManagement: {
                          ...prev.apiKeyManagement,
                          requireIpRestriction: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require IP Restriction"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.apiKeyManagement.requireExpiration}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        apiKeyManagement: {
                          ...prev.apiKeyManagement,
                          requireExpiration: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Require Expiration"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max API Keys"
                  value={config.apiKeyManagement.maxKeys}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    apiKeyManagement: {
                      ...prev.apiKeyManagement,
                      maxKeys: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Key Expiration (days)"
                  value={config.apiKeyManagement.keyExpirationDays}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    apiKeyManagement: {
                      ...prev.apiKeyManagement,
                      keyExpirationDays: Number(e.target.value)
                    }
                  }))}
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Emergency Stop</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.emergencyStop.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emergencyStop: {
                          ...prev.emergencyStop,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable Emergency Stop"
                />
              </Grid>
              {config.emergencyStop.enabled && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Conditions
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Daily Loss (%)"
                      value={config.emergencyStop.conditions.maxDailyLoss}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emergencyStop: {
                          ...prev.emergencyStop,
                          conditions: {
                            ...prev.emergencyStop.conditions,
                            maxDailyLoss: Number(e.target.value)
                          }
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
                      value={config.emergencyStop.conditions.maxDrawdown}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emergencyStop: {
                          ...prev.emergencyStop,
                          conditions: {
                            ...prev.emergencyStop.conditions,
                            maxDrawdown: Number(e.target.value)
                          }
                        }
                      }))}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Open Positions"
                      value={config.emergencyStop.conditions.maxOpenPositions}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emergencyStop: {
                          ...prev.emergencyStop,
                          conditions: {
                            ...prev.emergencyStop.conditions,
                            maxOpenPositions: Number(e.target.value)
                          }
                        }
                      }))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Leverage"
                      value={config.emergencyStop.conditions.maxLeverage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        emergencyStop: {
                          ...prev.emergencyStop,
                          conditions: {
                            ...prev.emergencyStop.conditions,
                            maxLeverage: Number(e.target.value)
                          }
                        }
                      }))}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Actions
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.emergencyStop.actions.closeAllPositions}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            emergencyStop: {
                              ...prev.emergencyStop,
                              actions: {
                                ...prev.emergencyStop.actions,
                                closeAllPositions: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Close All Positions"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.emergencyStop.actions.cancelAllOrders}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            emergencyStop: {
                              ...prev.emergencyStop,
                              actions: {
                                ...prev.emergencyStop.actions,
                                cancelAllOrders: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Cancel All Orders"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.emergencyStop.actions.disableTrading}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            emergencyStop: {
                              ...prev.emergencyStop,
                              actions: {
                                ...prev.emergencyStop.actions,
                                disableTrading: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Disable Trading"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.emergencyStop.actions.notifyAdmin}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            emergencyStop: {
                              ...prev.emergencyStop,
                              actions: {
                                ...prev.emergencyStop.actions,
                                notifyAdmin: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Notify Admin"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Security Notifications</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.securityNotifications.enabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        securityNotifications: {
                          ...prev.securityNotifications,
                          enabled: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Enable Security Notifications"
                />
              </Grid>
              {config.securityNotifications.enabled && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notification Channels
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.channels.email}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              channels: {
                                ...prev.securityNotifications.channels,
                                email: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Email"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.channels.telegram}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              channels: {
                                ...prev.securityNotifications.channels,
                                telegram: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Telegram"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.channels.webhook}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              channels: {
                                ...prev.securityNotifications.channels,
                                webhook: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Webhook"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notification Events
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.events.loginAttempt}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              events: {
                                ...prev.securityNotifications.events,
                                loginAttempt: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Login Attempts"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.events.apiKeyCreated}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              events: {
                                ...prev.securityNotifications.events,
                                apiKeyCreated: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="API Key Created"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.events.apiKeyDeleted}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              events: {
                                ...prev.securityNotifications.events,
                                apiKeyDeleted: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="API Key Deleted"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.events.settingsChanged}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              events: {
                                ...prev.securityNotifications.events,
                                settingsChanged: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Settings Changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.securityNotifications.events.emergencyStop}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            securityNotifications: {
                              ...prev.securityNotifications,
                              events: {
                                ...prev.securityNotifications.events,
                                emergencyStop: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label="Emergency Stop"
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

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Add IP Address</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="IP Address"
              type="text"
              fullWidth
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddIp} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings; 