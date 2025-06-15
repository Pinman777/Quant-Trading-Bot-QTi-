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
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'config' | 'data';
  timestamp: string;
  size: string;
  status: 'success' | 'error' | 'in_progress';
  description?: string;
}

interface BackupManagerProps {
  backups: Backup[];
  onCreateBackup: (type: Backup['type'], description?: string) => Promise<void>;
  onRestoreBackup: (id: string) => Promise<void>;
  onDeleteBackup: (id: string) => Promise<void>;
  onDownloadBackup: (id: string) => Promise<void>;
  onUploadBackup: (file: File) => Promise<void>;
  onScheduleBackup: (schedule: { frequency: string; time: string; type: Backup['type'] }) => Promise<void>;
}

const BackupManager: React.FC<BackupManagerProps> = ({
  backups,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onDownloadBackup,
  onUploadBackup,
  onScheduleBackup,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'restore' | 'schedule'>('create');
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [formData, setFormData] = useState({
    type: 'full' as Backup['type'],
    description: '',
    frequency: 'daily',
    time: '00:00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = (type: 'create' | 'restore' | 'schedule', backup?: Backup) => {
    setDialogType(type);
    setSelectedBackup(backup || null);
    setFormData({
      type: 'full',
      description: '',
      frequency: 'daily',
      time: '00:00',
    });
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBackup(null);
    setError(null);
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      await onCreateBackup(formData.type, formData.description);
      handleCloseDialog();
    } catch (err) {
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    try {
      setLoading(true);
      setError(null);
      await onRestoreBackup(selectedBackup.id);
      handleCloseDialog();
    } catch (err) {
      setError('Failed to restore backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      await onScheduleBackup({
        frequency: formData.frequency,
        time: formData.time,
        type: formData.type,
      });
      handleCloseDialog();
    } catch (err) {
      setError('Failed to schedule backup');
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
      await onUploadBackup(file);
    } catch (err) {
      setError('Failed to upload backup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Backup['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Backup Manager</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            type="file"
            accept=".zip,.tar,.gz"
            style={{ display: 'none' }}
            id="backup-upload"
            onChange={handleFileUpload}
          />
          <label htmlFor="backup-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
            >
              Upload
            </Button>
          </label>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => handleOpenDialog('schedule')}
          >
            Schedule
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Create Backup
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {backups.map((backup) => (
          <ListItem
            key={backup.id}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <ListItemText
              primary={backup.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {backup.type.charAt(0).toUpperCase() + backup.type.slice(1)} Backup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(backup.timestamp).toLocaleString()}
                  </Typography>
                  {backup.description && (
                    <Typography variant="body2" color="text.secondary">
                      {backup.description}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={backup.status}
                  color={getStatusColor(backup.status)}
                  size="small"
                />
                <Tooltip title="Download Backup">
                  <IconButton
                    edge="end"
                    onClick={() => onDownloadBackup(backup.id)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Restore Backup">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog('restore', backup)}
                    sx={{ mr: 1 }}
                  >
                    <RestoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Backup">
                  <IconButton
                    edge="end"
                    onClick={() => onDeleteBackup(backup.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'create' && 'Create Backup'}
          {dialogType === 'restore' && 'Restore Backup'}
          {dialogType === 'schedule' && 'Schedule Backup'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {dialogType === 'create' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Backup Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Backup Type"
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Backup['type'] }))}
                  >
                    <MenuItem value="full">Full Backup</MenuItem>
                    <MenuItem value="config">Configuration Only</MenuItem>
                    <MenuItem value="data">Data Only</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                />
              </>
            )}
            {dialogType === 'schedule' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Backup Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Backup Type"
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Backup['type'] }))}
                  >
                    <MenuItem value="full">Full Backup</MenuItem>
                    <MenuItem value="config">Configuration Only</MenuItem>
                    <MenuItem value="data">Data Only</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={formData.frequency}
                    label="Frequency"
                    onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Time"
                    value={new Date(`2000-01-01T${formData.time}`)}
                    onChange={(date) => setFormData((prev) => ({
                      ...prev,
                      time: date ? date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '00:00',
                    }))}
                  />
                </LocalizationProvider>
              </>
            )}
            {dialogType === 'restore' && (
              <Alert severity="warning">
                Are you sure you want to restore this backup? This will overwrite your current configuration.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogType === 'create' && (
            <Button
              onClick={handleCreateBackup}
              variant="contained"
              startIcon={<BackupIcon />}
              disabled={loading}
            >
              Create
            </Button>
          )}
          {dialogType === 'restore' && (
            <Button
              onClick={handleRestoreBackup}
              variant="contained"
              color="warning"
              startIcon={<RestoreIcon />}
              disabled={loading}
            >
              Restore
            </Button>
          )}
          {dialogType === 'schedule' && (
            <Button
              onClick={handleScheduleBackup}
              variant="contained"
              startIcon={<ScheduleIcon />}
              disabled={loading}
            >
              Schedule
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupManager; 