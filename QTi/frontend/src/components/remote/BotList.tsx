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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface Bot {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  config: any;
  lastUpdate: string;
}

interface BotListProps {
  serverId: string;
}

export const BotList: React.FC<BotListProps> = ({ serverId }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    config: ''
  });

  useEffect(() => {
    fetchBots();
  }, [serverId]);

  const fetchBots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/remote/servers/${serverId}/bots`);
      const data = await response.json();
      setBots(data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch bots', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (bot?: Bot) => {
    if (bot) {
      setSelectedBot(bot);
      setFormData({
        name: bot.name,
        config: JSON.stringify(bot.config, null, 2)
      });
    } else {
      setSelectedBot(null);
      setFormData({
        name: '',
        config: '{}'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBot(null);
  };

  const handleSubmit = async () => {
    try {
      const url = selectedBot
        ? `/api/v1/remote/servers/${serverId}/bots/${selectedBot.id}`
        : `/api/v1/remote/servers/${serverId}/bots`;
      
      const method = selectedBot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          config: JSON.parse(formData.config)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save bot');
      }

      enqueueSnackbar(
        `QTi Bot ${selectedBot ? 'updated' : 'added'} successfully`,
        { variant: 'success' }
      );
      
      handleClose();
      fetchBots();
    } catch (error) {
      enqueueSnackbar('Failed to save bot', { variant: 'error' });
    }
  };

  const handleStart = async (bot: Bot) => {
    try {
      const response = await fetch(
        `/api/v1/remote/servers/${serverId}/bots/${bot.id}/start`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to start bot');
      }

      enqueueSnackbar('QTi Bot started successfully', { variant: 'success' });
      fetchBots();
    } catch (error) {
      enqueueSnackbar('Failed to start bot', { variant: 'error' });
    }
  };

  const handleStop = async (bot: Bot) => {
    try {
      const response = await fetch(
        `/api/v1/remote/servers/${serverId}/bots/${bot.id}/stop`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to stop bot');
      }

      enqueueSnackbar('QTi Bot stopped successfully', { variant: 'success' });
      fetchBots();
    } catch (error) {
      enqueueSnackbar('Failed to stop bot', { variant: 'error' });
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
        <Typography variant="h6">QTi Bots</Typography>
        <Box>
          <IconButton onClick={fetchBots} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
          >
            Add Bot
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bots.map((bot) => (
              <TableRow key={bot.id}>
                <TableCell>{bot.name}</TableCell>
                <TableCell>
                  <Chip
                    label={bot.status}
                    color={
                      bot.status === 'running'
                        ? 'success'
                        : bot.status === 'error'
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>{new Date(bot.lastUpdate).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(bot)}
                  >
                    <SettingsIcon />
                  </IconButton>
                  {bot.status === 'running' ? (
                    <IconButton
                      size="small"
                      onClick={() => handleStop(bot)}
                      color="error"
                    >
                      <StopIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleStart(bot)}
                      color="success"
                    >
                      <StartIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBot ? 'Edit QTi Bot' : 'Add New QTi Bot'}
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
              label="Configuration"
              value={formData.config}
              onChange={(e) => setFormData({ ...formData, config: e.target.value })}
              multiline
              rows={10}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBot ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 