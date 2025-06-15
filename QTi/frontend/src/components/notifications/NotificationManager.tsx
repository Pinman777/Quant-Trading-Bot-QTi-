import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import NotificationForm from './NotificationForm';

interface Condition {
  type: 'price' | 'volume' | 'indicator' | 'custom';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'starts_with' | 'ends_with';
  value: string | number;
  metric?: string;
}

interface Recipient {
  type: 'email' | 'telegram' | 'webhook';
  value: string;
  enabled: boolean;
}

interface Notification {
  id: string;
  name: string;
  type: 'trade' | 'error' | 'system' | 'custom';
  message: string;
  conditions: Condition[];
  recipients: Recipient[];
  enabled: boolean;
  cooldown: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

interface NotificationManagerProps {
  notifications: Notification[];
  onAdd: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onEdit: (id: string, notification: Partial<Notification>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onRefresh,
  loading = false,
  error,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedNotification(null);
    setDialogType('add');
    setDialogOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        setActionLoading(true);
        setActionError(null);
        await onDelete(id);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to delete notification');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await onDuplicate(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to duplicate notification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      setActionLoading(true);
      setActionError(null);
      if (dialogType === 'add') {
        await onAdd(data);
      } else if (selectedNotification) {
        await onEdit(selectedNotification.id, data);
      }
      setDialogOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save notification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await onEdit(id, { enabled });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update notification');
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'trade':
        return 'success';
      case 'error':
        return 'error';
      case 'system':
        return 'info';
      case 'custom':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Notifications</Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={loading || actionLoading}
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            Add Notification
          </Button>
          <Tooltip title="Refresh">
            <IconButton
              onClick={() => onRefresh()}
              disabled={loading || actionLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {notifications.map((notification) => (
            <Grid item xs={12} sm={6} md={4} key={notification.id}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" noWrap>
                    {notification.name}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notification.enabled}
                        onChange={(e) => handleToggleEnabled(notification.id, e.target.checked)}
                        disabled={actionLoading}
                      />
                    }
                    label=""
                  />
                </Box>

                <Box mb={2}>
                  <Chip
                    label={notification.type}
                    color={getTypeColor(notification.type)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={notification.priority}
                    color={getPriorityColor(notification.priority)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {notification.message}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Conditions: {notification.conditions.length}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recipients: {notification.recipients.length}
                </Typography>

                {notification.lastTriggered && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Triggered: {new Date(notification.lastTriggered).toLocaleString()}
                  </Typography>
                )}

                <Box mt="auto" pt={2}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(notification)}
                          disabled={actionLoading}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Duplicate">
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicate(notification.id)}
                          disabled={actionLoading}
                        >
                          <DuplicateIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(notification.id)}
                          disabled={actionLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'add' ? 'New Notification' : 'Edit Notification'}
        </DialogTitle>
        <DialogContent>
          <NotificationForm
            initialData={selectedNotification || undefined}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
            loading={actionLoading}
            error={actionError || undefined}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NotificationManager; 