import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Delete,
  Edit,
  Add,
  CloudUpload,
  CloudDownload,
  Warning,
} from '@mui/icons-material';
import { serverApi } from '../services/api';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  lastSync: string;
  bots: number;
  configs: number;
}

interface ServerListProps {
  onError: (message: string) => void;
}

export const ServerList: React.FC<ServerListProps> = ({ onError }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newServer, setNewServer] = useState<Partial<Server>>({});

  const fetchServers = async () => {
    try {
      const data = await serverApi.getServers();
      setServers(data);
    } catch (error) {
      onError('Failed to fetch servers');
    }
  };

  const handleAddServer = async () => {
    try {
      await serverApi.addServer(newServer);
      setIsAddDialogOpen(false);
      setNewServer({});
      fetchServers();
    } catch (error) {
      onError('Failed to add server');
    }
  };

  const handleEditServer = async () => {
    if (!selectedServer) return;
    try {
      await serverApi.updateServer(selectedServer.id, selectedServer);
      setIsEditDialogOpen(false);
      fetchServers();
    } catch (error) {
      onError('Failed to update server');
    }
  };

  const handleDeleteServer = async (id: string) => {
    try {
      await serverApi.deleteServer(id);
      fetchServers();
    } catch (error) {
      onError('Failed to delete server');
    }
  };

  const handleSyncServer = async (id: string) => {
    try {
      await serverApi.syncServer(id);
      fetchServers();
    } catch (error) {
      onError('Failed to sync server');
    }
  };

  const handleRefreshServer = async (id: string) => {
    try {
      await serverApi.refreshServer(id);
      fetchServers();
    } catch (error) {
      onError('Failed to refresh server');
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Удаленные серверы</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Добавить сервер
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Хост</TableCell>
                <TableCell>Порт</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Последняя синхронизация</TableCell>
                <TableCell>Боты</TableCell>
                <TableCell>Конфигурации</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.name}</TableCell>
                  <TableCell>{server.host}</TableCell>
                  <TableCell>{server.port}</TableCell>
                  <TableCell>
                    <Chip
                      label={server.status}
                      color={server.status === 'online' ? 'success' : server.status === 'offline' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{server.lastSync}</TableCell>
                  <TableCell>{server.bots}</TableCell>
                  <TableCell>{server.configs}</TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="Обновить">
                        <IconButton
                          size="small"
                          onClick={() => handleRefreshServer(server.id)}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Синхронизировать на сервер">
                        <IconButton
                          size="small"
                          onClick={() => handleSyncServer(server.id)}
                        >
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Редактировать">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedServer(server);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteServer(server.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
          <DialogTitle>Добавить сервер</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название"
                  value={newServer.name || ''}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Хост"
                  value={newServer.host || ''}
                  onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Порт"
                  value={newServer.port || 22}
                  onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddServer} variant="contained" color="primary">
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
          <DialogTitle>Редактировать сервер</DialogTitle>
          <DialogContent>
            {selectedServer && (
              <>
                <TextField
                  fullWidth
                  label="Название"
                  value={selectedServer.name}
                  onChange={(e) => setSelectedServer({ ...selectedServer, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Хост"
                  value={selectedServer.host}
                  onChange={(e) => setSelectedServer({ ...selectedServer, host: e.target.value })}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Порт"
                  value={selectedServer.port || 22}
                  onChange={(e) => setSelectedServer({ ...selectedServer, port: parseInt(e.target.value) })}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleEditServer} variant="contained" color="primary">
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}; 