import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface RemoteStorage {
  name: string;
  type: string;
  total: number;
  used: number;
  free: number;
  trashed: number;
}

interface SyncConfig {
  remote_name: string;
  local_path: string;
  remote_path: string;
  exclude?: string[];
}

const RemoteStorage: React.FC = () => {
  const theme = useTheme();
  const [remotes, setRemotes] = useState<RemoteStorage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedRemote, setSelectedRemote] = useState<RemoteStorage | null>(null);
  const [newRemote, setNewRemote] = useState({
    name: '',
    type: '',
    config: {} as Record<string, string>
  });
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    remote_name: '',
    local_path: '',
    remote_path: '',
    exclude: []
  });

  const fetchRemotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/remote/list');
      if (!response.ok) throw new Error('Failed to fetch remotes');
      const data = await response.json();
      setRemotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch remotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemotes();
  }, []);

  const handleAddRemote = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/remote/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRemote)
      });
      if (!response.ok) throw new Error('Failed to add remote');
      await fetchRemotes();
      setAddDialogOpen(false);
      setNewRemote({ name: '', type: '', config: {} });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add remote');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRemote = async (name: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/remote/remove/${name}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to remove remote');
      await fetchRemotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove remote');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (direction: 'to' | 'from') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/remote/sync/${direction}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncConfig)
      });
      if (!response.ok) throw new Error(`Failed to sync ${direction} remote`);
      setSyncDialogOpen(false);
      setSyncConfig({ remote_name: '', local_path: '', remote_path: '', exclude: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sync ${direction} remote`);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Remote Storage
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Remote
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {remotes.map((remote) => (
            <Grid item xs={12} md={6} lg={4} key={remote.name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{remote.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRemote(remote);
                          setSyncConfig(prev => ({ ...prev, remote_name: remote.name }));
                          setSyncDialogOpen(true);
                        }}
                      >
                        <SyncIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRemote(remote.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Type: {remote.type}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Total: {formatBytes(remote.total)}
                    </Typography>
                    <Typography variant="body2">
                      Used: {formatBytes(remote.used)}
                    </Typography>
                    <Typography variant="body2">
                      Free: {formatBytes(remote.free)}
                    </Typography>
                    {remote.trashed > 0 && (
                      <Typography variant="body2">
                        Trashed: {formatBytes(remote.trashed)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Remote Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Remote Storage</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newRemote.name}
            onChange={(e) => setNewRemote(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Type"
            fullWidth
            value={newRemote.type}
            onChange={(e) => setNewRemote(prev => ({ ...prev, type: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Configuration (JSON)"
            fullWidth
            multiline
            rows={4}
            value={JSON.stringify(newRemote.config, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setNewRemote(prev => ({ ...prev, config }));
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRemote} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)}>
        <DialogTitle>Sync Files</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Local Path"
            fullWidth
            value={syncConfig.local_path}
            onChange={(e) => setSyncConfig(prev => ({ ...prev, local_path: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Remote Path"
            fullWidth
            value={syncConfig.remote_path}
            onChange={(e) => setSyncConfig(prev => ({ ...prev, remote_path: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Exclude Patterns (comma-separated)"
            fullWidth
            value={syncConfig.exclude?.join(',') || ''}
            onChange={(e) => setSyncConfig(prev => ({
              ...prev,
              exclude: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSync('to')} variant="contained" color="primary">
            Sync To Remote
          </Button>
          <Button onClick={() => handleSync('from')} variant="contained" color="secondary">
            Sync From Remote
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RemoteStorage; 