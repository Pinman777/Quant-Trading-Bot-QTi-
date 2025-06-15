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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ConfigForm from './ConfigForm';

interface Config {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  parameters: any[];
  riskManagement: any;
  tradingSchedule: any;
  notifications: any[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'error';
}

interface ConfigEditorProps {
  configs: Config[];
  onAdd: (config: any) => Promise<void>;
  onEdit: (id: string, config: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({
  configs,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
  onStop,
  onRefresh,
  loading = false,
  error,
}) => {
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedConfig(null);
    setDialogType('add');
    setDialogOpen(true);
  };

  const handleEdit = (config: Config) => {
    setSelectedConfig(config);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        setActionLoading(true);
        setActionError(null);
        await onDelete(id);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to delete configuration');
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
      setActionError(err instanceof Error ? err.message : 'Failed to duplicate configuration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (id: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await onStart(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to start configuration');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async (id: string) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await onStop(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to stop configuration');
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
      } else if (selectedConfig) {
        await onEdit(selectedConfig.id, data);
      }
      setDialogOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: Config['status']) => {
    switch (status) {
      case 'active':
        return 'success.main';
      case 'inactive':
        return 'grey.500';
      case 'error':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Bot Configurations</Typography>
        <Box>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={loading || actionLoading}
            sx={{ mr: 1 }}
          >
            Add Configuration
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
          {configs.map((config) => (
            <Grid item xs={12} sm={6} md={4} key={config.id}>
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
                    {config.name}
                  </Typography>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(config.status),
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {config.exchange.toUpperCase()} - {config.symbol}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Strategy: {config.strategy}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Timeframe: {config.timeframe}
                </Typography>

                <Box mt="auto" pt={2}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(config)}
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
                          onClick={() => handleDuplicate(config.id)}
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
                          onClick={() => handleDelete(config.id)}
                          disabled={actionLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      {config.status === 'active' ? (
                        <Tooltip title="Stop">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStop(config.id)}
                            disabled={actionLoading}
                          >
                            <StopIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Start">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStart(config.id)}
                            disabled={actionLoading}
                          >
                            <StartIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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
          {dialogType === 'add' ? 'New Configuration' : 'Edit Configuration'}
        </DialogTitle>
        <DialogContent>
          <ConfigForm
            initialData={selectedConfig || undefined}
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

export default ConfigEditor; 