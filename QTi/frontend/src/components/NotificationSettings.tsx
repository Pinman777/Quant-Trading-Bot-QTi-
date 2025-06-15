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
  Notifications as NotificationsIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Webhook as WebhookIcon,
  TestTube as TestTubeIcon
} from '@mui/icons-material';

interface NotificationSettingsProps {
  botId: string;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'telegram' | 'webhook';
  name: string;
  enabled: boolean;
  config: {
    email?: string;
    telegramChatId?: string;
    telegramBotToken?: string;
    webhookUrl?: string;
    webhookSecret?: string;
  };
  events: string[];
  cooldown: number;
}

interface NotificationSettings {
  channels: NotificationChannel[];
  globalCooldown: number;
  defaultEvents: string[];
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    channels: [],
    globalCooldown: 60,
    defaultEvents: []
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testChannel, setTestChannel] = useState<NotificationChannel | null>(null);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [botId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/notification-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (channel?: NotificationChannel) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({
        ...channel,
        config: {
          ...channel.config,
          telegramBotToken: channel.config.telegramBotToken
            ? '••••••••' + channel.config.telegramBotToken.slice(-4)
            : '',
          webhookSecret: channel.config.webhookSecret
            ? '••••••••' + channel.config.webhookSecret.slice(-4)
            : ''
        }
      });
    } else {
      setEditingChannel(null);
      setFormData({
        type: 'email',
        name: '',
        enabled: true,
        config: {},
        events: [],
        cooldown: 60
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingChannel(null);
    setFormData({
      type: 'email',
      name: '',
      enabled: true,
      config: {},
      events: [],
      cooldown: 60
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const handleEventChange = (event: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      events: checked
        ? [...(prev.events || []), event]
        : (prev.events || []).filter(e => e !== event)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = editingChannel
        ? `/api/bots/${botId}/notification-settings/channels/${editingChannel.id}`
        : `/api/bots/${botId}/notification-settings/channels`;

      const response = await fetch(url, {
        method: editingChannel ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save notification channel');
      }

      setSuccess(editingChannel ? 'Channel updated successfully' : 'Channel added successfully');
      handleDialogClose();
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (channelId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification channel?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/notification-settings/channels/${channelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification channel');
      }

      setSuccess('Channel deleted successfully');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestChannel = async (channelId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/notification-settings/channels/${channelId}/test`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to test notification channel');
      }

      setSuccess('Test notification sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <EmailIcon />;
      case 'telegram':
        return <TelegramIcon />;
      case 'webhook':
        return <WebhookIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  if (loading && !settings.channels.length) {
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
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notification Settings</Typography>
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
                  label="Global Cooldown (seconds)"
                  value={settings.globalCooldown}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    globalCooldown: Number(e.target.value)
                  }))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Notification Channels</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleDialogOpen()}
              >
                Add Channel
              </Button>
            </Box>

            <List>
              {settings.channels.map((channel) => (
                <ListItem
                  key={channel.id}
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
                        {getChannelIcon(channel.type)}
                        <Typography variant="subtitle1" sx={{ ml: 1 }}>
                          {channel.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: channel.enabled ? 'success.main' : 'error.main',
                            color: 'white'
                          }}
                        >
                          {channel.enabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {channel.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Events: {channel.events.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cooldown: {channel.cooldown} seconds
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Test Channel">
                      <IconButton
                        onClick={() => handleTestChannel(channel.id)}
                        sx={{ mr: 1 }}
                      >
                        <TestTubeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleDialogOpen(channel)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(channel.id)}
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
            {editingChannel ? 'Edit Notification Channel' : 'Add Notification Channel'}
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Channel Type
                  </Typography>
                  <Grid container spacing={2}>
                    {['email', 'telegram', 'webhook'].map((type) => (
                      <Grid item xs={12} sm={4} key={type}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.type === type}
                              onChange={() => handleInputChange('type', type)}
                            />
                          }
                          label={type.charAt(0).toUpperCase() + type.slice(1)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {formData.type === 'email' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.config?.email || ''}
                      onChange={(e) => handleConfigChange('email', e.target.value)}
                    />
                  </Grid>
                )}

                {formData.type === 'telegram' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telegram Chat ID"
                        value={formData.config?.telegramChatId || ''}
                        onChange={(e) => handleConfigChange('telegramChatId', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telegram Bot Token"
                        type="password"
                        value={formData.config?.telegramBotToken || ''}
                        onChange={(e) => handleConfigChange('telegramBotToken', e.target.value)}
                      />
                    </Grid>
                  </>
                )}

                {formData.type === 'webhook' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Webhook URL"
                        value={formData.config?.webhookUrl || ''}
                        onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Webhook Secret"
                        type="password"
                        value={formData.config?.webhookSecret || ''}
                        onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Events
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      'trade_executed',
                      'position_opened',
                      'position_closed',
                      'stop_loss_triggered',
                      'take_profit_triggered',
                      'error_occurred',
                      'bot_started',
                      'bot_stopped'
                    ].map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.events?.includes(event)}
                              onChange={(e) => handleEventChange(event, e.target.checked)}
                            />
                          }
                          label={event.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Channel Cooldown (seconds)"
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
              {editingChannel ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 