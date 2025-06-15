import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

interface SignalCondition {
  id: string;
  indicator: string;
  operator: string;
  value: number;
  timeframe: string;
}

interface SignalNotification {
  id: string;
  name: string;
  enabled: boolean;
  conditions: SignalCondition[];
  channels: {
    email: boolean;
    telegram: boolean;
    webhook: boolean;
  };
  cooldown: number;
  priority: 'low' | 'medium' | 'high';
}

interface SignalNotificationsProps {
  botId: string;
}

const SignalNotifications: React.FC<SignalNotificationsProps> = ({ botId }) => {
  const [notifications, setNotifications] = useState<SignalNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<SignalNotification | null>(null);
  const [availableIndicators, setAvailableIndicators] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<SignalNotification>>({
    name: '',
    enabled: true,
    conditions: [],
    channels: {
      email: false,
      telegram: false,
      webhook: false
    },
    cooldown: 60,
    priority: 'medium'
  });

  useEffect(() => {
    fetchNotifications();
    fetchIndicators();
  }, [botId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/signal-notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch signal notifications');
      }

      const data = await response.json();
      setNotifications(data);
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
      setAvailableIndicators(data);
    } catch (err) {
      console.error('Failed to fetch indicators:', err);
    }
  };

  const handleDialogOpen = (notification?: SignalNotification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData(notification);
    } else {
      setEditingNotification(null);
      setFormData({
        name: '',
        enabled: true,
        conditions: [],
        channels: {
          email: false,
          telegram: false,
          webhook: false
        },
        cooldown: 60,
        priority: 'medium'
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingNotification(null);
    setFormData({
      name: '',
      enabled: true,
      conditions: [],
      channels: {
        email: false,
        telegram: false,
        webhook: false
      },
      cooldown: 60,
      priority: 'medium'
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChannelChange = (channel: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        {
          id: Date.now().toString(),
          indicator: '',
          operator: '>',
          value: 0,
          timeframe: '1h'
        }
      ]
    }));
  };

  const handleRemoveCondition = (conditionId: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter(c => c.id !== conditionId)
    }));
  };

  const handleConditionChange = (conditionId: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.map(c =>
        c.id === conditionId ? { ...c, [field]: value } : c
      )
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = editingNotification
        ? `/api/bots/${botId}/signal-notifications/${editingNotification.id}`
        : `/api/bots/${botId}/signal-notifications`;

      const response = await fetch(url, {
        method: editingNotification ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save signal notification');
      }

      setSuccess(editingNotification ? 'Notification updated successfully' : 'Notification added successfully');
      handleDialogClose();
      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/signal-notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setSuccess('Notification deleted successfully');
      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !notifications.length) {
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
          <Typography variant="h6">Signal Notifications</Typography>
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

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
          >
            Add Notification
          </Button>
        </Box>

        <List>
          {notifications.map(notification => (
            <ListItem
              key={notification.id}
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
                    <Typography variant="subtitle1">{notification.name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        ml: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: notification.priority === 'high' ? 'error.main' :
                                notification.priority === 'medium' ? 'warning.main' :
                                'success.main',
                        color: 'white'
                      }}
                    >
                      {notification.priority}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Conditions: {notification.conditions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Channels: {Object.entries(notification.channels)
                        .filter(([_, enabled]) => enabled)
                        .map(([channel]) => channel)
                        .join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cooldown: {notification.cooldown} minutes
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleDialogOpen(notification)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(notification.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingNotification ? 'Edit Notification' : 'Add Notification'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cooldown (minutes)"
                    value={formData.cooldown}
                    onChange={(e) => handleInputChange('cooldown', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Conditions
                  </Typography>
                  {formData.conditions?.map((condition, index) => (
                    <Box key={condition.id} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Indicator</InputLabel>
                            <Select
                              value={condition.indicator}
                              label="Indicator"
                              onChange={(e) => handleConditionChange(condition.id, 'indicator', e.target.value)}
                            >
                              {availableIndicators.map(indicator => (
                                <MenuItem key={indicator} value={indicator}>
                                  {indicator}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControl fullWidth>
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={condition.operator}
                              label="Operator"
                              onChange={(e) => handleConditionChange(condition.id, 'operator', e.target.value)}
                            >
                              <MenuItem value=">">&gt;</MenuItem>
                              <MenuItem value="<">&lt;</MenuItem>
                              <MenuItem value=">=">&ge;</MenuItem>
                              <MenuItem value="<=">&le;</MenuItem>
                              <MenuItem value="==">=</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Value"
                            value={condition.value}
                            onChange={(e) => handleConditionChange(condition.id, 'value', Number(e.target.value))}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel>Timeframe</InputLabel>
                            <Select
                              value={condition.timeframe}
                              label="Timeframe"
                              onChange={(e) => handleConditionChange(condition.id, 'timeframe', e.target.value)}
                            >
                              <MenuItem value="1m">1 minute</MenuItem>
                              <MenuItem value="5m">5 minutes</MenuItem>
                              <MenuItem value="15m">15 minutes</MenuItem>
                              <MenuItem value="30m">30 minutes</MenuItem>
                              <MenuItem value="1h">1 hour</MenuItem>
                              <MenuItem value="4h">4 hours</MenuItem>
                              <MenuItem value="1d">1 day</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveCondition(condition.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddCondition}
                    sx={{ mt: 1 }}
                  >
                    Add Condition
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Channels
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.channels?.email}
                            onChange={(e) => handleChannelChange('email', e.target.checked)}
                          />
                        }
                        label="Email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.channels?.telegram}
                            onChange={(e) => handleChannelChange('telegram', e.target.checked)}
                          />
                        }
                        label="Telegram"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.channels?.webhook}
                            onChange={(e) => handleChannelChange('webhook', e.target.checked)}
                          />
                        }
                        label="Webhook"
                      />
                    </Grid>
                  </Grid>
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
              {editingNotification ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SignalNotifications; 