import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useWebSocket } from '../components/WebSocketProvider';

export default function RemotePage() {
  const { remoteServers, sendMessage } = useWebSocket();
  const [open, setOpen] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    host: '',
    username: '',
    password: '',
  });
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddServer = () => {
    sendMessage(JSON.stringify({
      type: 'add_remote',
      ...newServer,
    }));
    handleClose();
  };

  const handleDeleteServer = (name: string) => {
    sendMessage(JSON.stringify({
      type: 'delete_remote',
      name,
    }));
  };

  const handleSyncServer = (name: string) => {
    setSyncing(name);
    sendMessage(JSON.stringify({
      type: 'sync_remote',
      name,
    }));
    // Сбрасываем состояние синхронизации через 30 секунд
    setTimeout(() => setSyncing(null), 30000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Удаленные серверы</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Добавить сервер
        </Button>
      </Box>

      <Grid container spacing={3}>
        {remoteServers.map((server) => (
          <Grid item xs={12} md={6} key={server.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {server.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {server.host}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="body2"
                    color={server.status === 'connected' ? 'success.main' : 'error.main'}
                  >
                    {server.status === 'connected' ? 'Подключено' : 'Отключено'}
                  </Typography>
                  {server.lastSync && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                      Последняя синхронизация: {new Date(server.lastSync).toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleSyncServer(server.name)}
                    disabled={syncing === server.name}
                  >
                    {syncing === server.name ? (
                      <CircularProgress size={24} />
                    ) : (
                      <SyncIcon />
                    )}
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteServer(server.name)}
                    disabled={syncing === server.name}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Добавить удаленный сервер</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Имя сервера"
                value={newServer.name}
                onChange={(e) =>
                  setNewServer({ ...newServer, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Хост"
                value={newServer.host}
                onChange={(e) =>
                  setNewServer({ ...newServer, host: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Имя пользователя"
                value={newServer.username}
                onChange={(e) =>
                  setNewServer({ ...newServer, username: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Пароль"
                type="password"
                value={newServer.password}
                onChange={(e) =>
                  setNewServer({ ...newServer, password: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleAddServer} variant="contained" color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 