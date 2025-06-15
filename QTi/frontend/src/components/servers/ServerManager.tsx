import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline' | 'syncing';
  lastSync: string;
  configPath: string;
  rcloneConfig: {
    remote: string;
    bucket: string;
    region: string;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

interface ServerManagerProps {
  servers: Server[];
  onAdd: (server: Omit<Server, 'id' | 'status' | 'lastSync'>) => Promise<void>;
  onEdit: (id: string, server: Partial<Server>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSync: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const ServerManager: React.FC<ServerManagerProps> = ({
  servers,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onRefresh,
  loading = false,
  error = null,
}) => {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newServer, setNewServer] = useState<Partial<Server>>({});

  const handleAdd = async () => {
    await onAdd(newServer as Omit<Server, 'id' | 'status' | 'lastSync'>);
    setShowAddDialog(false);
    setNewServer({});
  };

  const handleEdit = async () => {
    if (selectedServer) {
      await onEdit(selectedServer.id, newServer);
      setShowEditDialog(false);
      setSelectedServer(null);
      setNewServer({});
    }
  };

  const handleDelete = async () => {
    if (selectedServer) {
      await onDelete(selectedServer.id);
      setShowDeleteDialog(false);
      setSelectedServer(null);
    }
  };

  const handleSync = async (id: string) => {
    await onSync(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'syncing':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon />;
      case 'offline':
        return <ErrorIcon />;
      case 'syncing':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Remote Servers</Typography>
        <Box>
          <Tooltip title="Refresh Servers">
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            disabled={loading}
          >
            Add Server
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {servers.map((server) => (
          <Grid item xs={12} md={6} lg={4} key={server.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{server.name}</Typography>
                  <Chip
                    icon={getStatusIcon(server.status)}
                    label={server.status}
                    color={getStatusColor(server.status)}
                    size="small"
                  />
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ComputerIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Host"
                      secondary={`${server.host}:${server.port}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Config Path"
                      secondary={server.configPath}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NetworkCheckIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Sync"
                      secondary={new Date(server.lastSync).toLocaleString()}
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Resources
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      CPU Usage
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={server.resources.cpu}
                      color={server.resources.cpu > 80 ? 'error' : 'primary'}
                    />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={server.resources.memory}
                      color={server.resources.memory > 80 ? 'error' : 'primary'}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Disk Usage
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={server.resources.disk}
                      color={server.resources.disk > 80 ? 'error' : 'primary'}
                    />
                  </Box>
                </Box>
              </CardContent>
              <Divider />
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setSelectedServer(server);
                    setNewServer(server);
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setSelectedServer(server);
                    setShowDeleteDialog(true);
                  }}
                  color="error"
                >
                  Delete
                </Button>
                <Button
                  size="small"
                  startIcon={<SyncIcon />}
                  onClick={() => handleSync(server.id)}
                  disabled={server.status === 'syncing'}
                >
                  Sync
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Server Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Server</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Server Name"
                value={newServer.name || ''}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Host"
                value={newServer.host || ''}
                onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Port"
                value={newServer.port || ''}
                onChange={(e) => setNewServer({ ...newServer, port: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={newServer.username || ''}
                onChange={(e) => setNewServer({ ...newServer, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Config Path"
                value={newServer.configPath || ''}
                onChange={(e) => setNewServer({ ...newServer, configPath: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Rclone Configuration
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Remote"
                value={newServer.rcloneConfig?.remote || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, remote: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bucket"
                value={newServer.rcloneConfig?.bucket || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, bucket: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Region"
                value={newServer.rcloneConfig?.region || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, region: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Server'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Server Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Server</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Server Name"
                value={newServer.name || ''}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Host"
                value={newServer.host || ''}
                onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Port"
                value={newServer.port || ''}
                onChange={(e) => setNewServer({ ...newServer, port: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={newServer.username || ''}
                onChange={(e) => setNewServer({ ...newServer, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Config Path"
                value={newServer.configPath || ''}
                onChange={(e) => setNewServer({ ...newServer, configPath: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Rclone Configuration
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Remote"
                value={newServer.rcloneConfig?.remote || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, remote: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bucket"
                value={newServer.rcloneConfig?.bucket || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, bucket: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Region"
                value={newServer.rcloneConfig?.region || ''}
                onChange={(e) =>
                  setNewServer({
                    ...newServer,
                    rcloneConfig: { ...newServer.rcloneConfig, region: e.target.value },
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Server Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Server</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete server "{selectedServer?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerManager; 