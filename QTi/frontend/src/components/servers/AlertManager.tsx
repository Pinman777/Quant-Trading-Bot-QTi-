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
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface Alert {
  id: string;
  name: string;
  type: 'server' | 'bot' | 'system';
  condition: {
    metric: string;
    operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
    value: number;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  notification: {
    email: boolean;
    telegram: boolean;
    webhook: boolean;
    webhookUrl?: string;
  };
  enabled: boolean;
}

interface AlertManagerProps {
  alerts: Alert[];
  onAddAlert: (alert: Omit<Alert, 'id'>) => void;
  onEditAlert: (id: string, alert: Omit<Alert, 'id'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
}

const AlertManager: React.FC<AlertManagerProps> = ({
  alerts,
  onAddAlert,
  onEditAlert,
  onDeleteAlert,
  onToggleAlert,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'server' as Alert['type'],
    condition: {
      metric: 'cpu',
      operator: '>' as Alert['condition']['operator'],
      value: 0,
    },
    severity: 'warning' as Alert['severity'],
    notification: {
      email: false,
      telegram: false,
      webhook: false,
      webhookUrl: '',
    },
    enabled: true,
  });

  const handleOpenDialog = (alert?: Alert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        name: alert.name,
        type: alert.type,
        condition: alert.condition,
        severity: alert.severity,
        notification: alert.notification,
        enabled: alert.enabled,
      });
    } else {
      setEditingAlert(null);
      setFormData({
        name: '',
        type: 'server',
        condition: {
          metric: 'cpu',
          operator: '>',
          value: 0,
        },
        severity: 'warning',
        notification: {
          email: false,
          telegram: false,
          webhook: false,
          webhookUrl: '',
        },
        enabled: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAlert(null);
  };

  const handleSave = () => {
    if (editingAlert) {
      onEditAlert(editingAlert.id, formData);
    } else {
      onAddAlert(formData);
    }
    handleCloseDialog();
  };

  const getMetricOptions = (type: Alert['type']) => {
    switch (type) {
      case 'server':
        return [
          { value: 'cpu', label: 'CPU Usage' },
          { value: 'memory', label: 'Memory Usage' },
          { value: 'disk', label: 'Disk Usage' },
          { value: 'uptime', label: 'Uptime' },
        ];
      case 'bot':
        return [
          { value: 'pnl', label: 'PnL' },
          { value: 'drawdown', label: 'Drawdown' },
          { value: 'winRate', label: 'Win Rate' },
          { value: 'trades', label: 'Number of Trades' },
        ];
      case 'system':
        return [
          { value: 'errors', label: 'Error Count' },
          { value: 'warnings', label: 'Warning Count' },
          { value: 'latency', label: 'API Latency' },
        ];
      default:
        return [];
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info':
        return 'primary';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Alerts & Notifications</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Alert
        </Button>
      </Box>

      <List>
        {alerts.map((alert) => (
          <ListItem
            key={alert.id}
            component={Paper}
            sx={{ mb: 1, p: 2 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{alert.name}</Typography>
                  <Chip
                    size="small"
                    label={alert.severity}
                    color={getSeverityColor(alert.severity)}
                  />
                  <Chip
                    size="small"
                    label={alert.type}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {alert.condition.metric} {alert.condition.operator} {alert.condition.value}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    {alert.notification.email && (
                      <Chip size="small" label="Email" />
                    )}
                    {alert.notification.telegram && (
                      <Chip size="small" label="Telegram" />
                    )}
                    {alert.notification.webhook && (
                      <Chip size="small" label="Webhook" />
                    )}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title={alert.enabled ? 'Disable Alert' : 'Enable Alert'}>
                <IconButton
                  edge="end"
                  onClick={() => onToggleAlert(alert.id)}
                  color={alert.enabled ? 'success' : 'default'}
                  sx={{ mr: 1 }}
                >
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Alert">
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(alert)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Alert">
                <IconButton
                  edge="end"
                  onClick={() => onDeleteAlert(alert.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAlert ? 'Edit Alert' : 'Add Alert'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Alert Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={formData.type}
                label="Alert Type"
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Alert['type'] }))}
              >
                <MenuItem value="server">Server</MenuItem>
                <MenuItem value="bot">Bot</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Metric</InputLabel>
                <Select
                  value={formData.condition.metric}
                  label="Metric"
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    condition: { ...prev.condition, metric: e.target.value },
                  }))}
                >
                  {getMetricOptions(formData.type).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={formData.condition.operator}
                  label="Operator"
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    condition: { ...prev.condition, operator: e.target.value as Alert['condition']['operator'] },
                  }))}
                >
                  <MenuItem value=">">{'>'}</MenuItem>
                  <MenuItem value="<">{'<'}</MenuItem>
                  <MenuItem value="=">{'='}</MenuItem>
                  <MenuItem value="!=">{'!='}</MenuItem>
                  <MenuItem value=">=">{'>='}</MenuItem>
                  <MenuItem value="<=">{'<='}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="number"
                label="Value"
                value={formData.condition.value}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  condition: { ...prev.condition, value: parseFloat(e.target.value) },
                }))}
                fullWidth
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={formData.severity}
                label="Severity"
                onChange={(e) => setFormData((prev) => ({ ...prev, severity: e.target.value as Alert['severity'] }))}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Notification Methods
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notification.email}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      notification: { ...prev.notification, email: e.target.checked },
                    }))}
                  />
                }
                label="Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notification.telegram}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      notification: { ...prev.notification, telegram: e.target.checked },
                    }))}
                  />
                }
                label="Telegram"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notification.webhook}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      notification: { ...prev.notification, webhook: e.target.checked },
                    }))}
                  />
                }
                label="Webhook"
              />
              {formData.notification.webhook && (
                <TextField
                  label="Webhook URL"
                  value={formData.notification.webhookUrl}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    notification: { ...prev.notification, webhookUrl: e.target.value },
                  }))}
                  fullWidth
                />
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enable Alert"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || (formData.notification.webhook && !formData.notification.webhookUrl)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertManager; 