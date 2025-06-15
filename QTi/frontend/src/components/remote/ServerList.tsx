import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Server, remoteService } from '../../services/remote';
import { useSnackbar } from 'notistack';

interface ServerListProps {
  onServerSelect: (server: Server) => void;
}

export const ServerList: React.FC<ServerListProps> = ({ onServerSelect }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    host: '',
    username: '',
    password: '',
    port: 22
  });

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const data = await remoteService.getServers();
      setServers(data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch servers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (server?: Server) => {
    if (server) {
      setEditingServer(server);
      setFormData({
        name: server.name,
        host: server.host,
        username: server.username,
        password: '',
        port: server.port
      });
    } else {
      setEditingServer(null);
      setFormData({
        name: '',
        host: '',
        username: '',
        password: '',
        port: 22
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingServer(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingServer) {
        await remoteService.updateServer(editingServer.id, formData);
        enqueueSnackbar('Server updated successfully', { variant: 'success' });
      } else {
        await remoteService.createServer(formData);
        enqueueSnackbar('Server added successfully', { variant: 'success' });
      }
      
      handleClose();
      fetchServers();
    } catch (error) {
      enqueueSnackbar('Failed to save server', { variant: 'error' });
    }
  };

  const handleDelete = async (server: Server) => {
    if (!window.confirm('Are you sure you want to delete this server?')) {
      return;
    }

    try {
      await remoteService.deleteServer(server.id);
      enqueueSnackbar('Server deleted successfully', { variant: 'success' });
      fetchServers();
    } catch (error) {
      enqueueSnackbar('Failed to delete server', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">QTi Remote Servers</Typography>
        <Box>
          <IconButton onClick={fetchServers} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Server
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Port</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((server) => (
              <TableRow
                key={server.id}
                hover
                onClick={() => onServerSelect(server)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.host}</TableCell>
                <TableCell>{server.username}</TableCell>
                <TableCell>{server.port}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(server);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(server);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingServer ? 'Edit Server' : 'Add New Server'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Host"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              fullWidth
            />
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
            />
            <TextField
              label="Port"
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingServer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 