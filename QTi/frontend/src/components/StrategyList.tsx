import React, { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Delete,
  Edit,
  Settings,
  Add,
} from '@mui/icons-material';

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'grid' | 'martingale' | 'custom';
  status: 'active' | 'inactive';
  parameters: {
    gridSize: number;
    gridSpacing: number;
    maxPositions: number;
    stopLoss: number;
    takeProfit: number;
    [key: string]: any;
  };
  performance: {
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    averageProfit: number;
    maxDrawdown: number;
  };
  lastUpdate: string;
}

interface StrategyListProps {
  strategies: Strategy[];
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (strategy: Strategy) => void;
  onAdd: (strategy: Omit<Strategy, 'id' | 'status' | 'performance' | 'lastUpdate'>) => void;
}

export default function StrategyList({
  strategies,
  onStart,
  onStop,
  onRefresh,
  onDelete,
  onEdit,
  onAdd,
}: StrategyListProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState<Partial<Strategy>>({
    name: '',
    description: '',
    type: 'grid',
    parameters: {
      gridSize: 10,
      gridSpacing: 0.1,
      maxPositions: 5,
      stopLoss: 2,
      takeProfit: 2,
    },
  });

  const handleAddClick = () => {
    setNewStrategy({
      name: '',
      description: '',
      type: 'grid',
      parameters: {
        gridSize: 10,
        gridSpacing: 0.1,
        maxPositions: 5,
        stopLoss: 2,
        takeProfit: 2,
      },
    });
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setIsEditDialogOpen(true);
  };

  const handleAddSubmit = () => {
    if (newStrategy.name && newStrategy.description && newStrategy.type) {
      onAdd(newStrategy as Omit<Strategy, 'id' | 'status' | 'performance' | 'lastUpdate'>);
      setIsAddDialogOpen(false);
    }
  };

  const handleEditSubmit = () => {
    if (selectedStrategy) {
      onEdit(selectedStrategy);
      setIsEditDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grid':
        return 'primary';
      case 'martingale':
        return 'secondary';
      case 'custom':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Стратегии</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddClick}
        >
          Добавить стратегию
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Прибыль</TableCell>
              <TableCell>Винрейт</TableCell>
              <TableCell>Сделки</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {strategies.map((strategy) => (
              <TableRow key={strategy.id}>
                <TableCell>{strategy.name}</TableCell>
                <TableCell>
                  <Chip
                    label={strategy.type}
                    color={getTypeColor(strategy.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={strategy.status}
                    color={getStatusColor(strategy.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{strategy.performance.totalProfit.toFixed(2)}%</TableCell>
                <TableCell>{strategy.performance.winRate.toFixed(2)}%</TableCell>
                <TableCell>{strategy.performance.totalTrades}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onStart(strategy.id)}
                    disabled={strategy.status === 'active'}
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onStop(strategy.id)}
                    disabled={strategy.status === 'inactive'}
                  >
                    <Stop />
                  </IconButton>
                  <IconButton size="small" onClick={() => onRefresh(strategy.id)}>
                    <Refresh />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEditClick(strategy)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(strategy.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Strategy Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Добавить стратегию</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={newStrategy.name}
            onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Описание"
            value={newStrategy.description}
            onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Тип"
            select
            value={newStrategy.type}
            onChange={(e) => setNewStrategy({ ...newStrategy, type: e.target.value as Strategy['type'] })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="grid">Grid</option>
            <option value="martingale">Martingale</option>
            <option value="custom">Custom</option>
          </TextField>
          <TextField
            fullWidth
            label="Grid Size"
            type="number"
            value={newStrategy.parameters?.gridSize}
            onChange={(e) =>
              setNewStrategy({
                ...newStrategy,
                parameters: { ...newStrategy.parameters, gridSize: Number(e.target.value) },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Grid Spacing"
            type="number"
            value={newStrategy.parameters?.gridSpacing}
            onChange={(e) =>
              setNewStrategy({
                ...newStrategy,
                parameters: { ...newStrategy.parameters, gridSpacing: Number(e.target.value) },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Max Positions"
            type="number"
            value={newStrategy.parameters?.maxPositions}
            onChange={(e) =>
              setNewStrategy({
                ...newStrategy,
                parameters: { ...newStrategy.parameters, maxPositions: Number(e.target.value) },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Stop Loss"
            type="number"
            value={newStrategy.parameters?.stopLoss}
            onChange={(e) =>
              setNewStrategy({
                ...newStrategy,
                parameters: { ...newStrategy.parameters, stopLoss: Number(e.target.value) },
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Take Profit"
            type="number"
            value={newStrategy.parameters?.takeProfit}
            onChange={(e) =>
              setNewStrategy({
                ...newStrategy,
                parameters: { ...newStrategy.parameters, takeProfit: Number(e.target.value) },
              })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddSubmit} color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Strategy Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Редактировать стратегию</DialogTitle>
        <DialogContent>
          {selectedStrategy && (
            <>
              <TextField
                fullWidth
                label="Название"
                value={selectedStrategy.name}
                onChange={(e) =>
                  setSelectedStrategy({ ...selectedStrategy, name: e.target.value })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Описание"
                value={selectedStrategy.description}
                onChange={(e) =>
                  setSelectedStrategy({ ...selectedStrategy, description: e.target.value })
                }
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Тип"
                select
                value={selectedStrategy.type}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    type: e.target.value as Strategy['type'],
                  })
                }
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="grid">Grid</option>
                <option value="martingale">Martingale</option>
                <option value="custom">Custom</option>
              </TextField>
              <TextField
                fullWidth
                label="Grid Size"
                type="number"
                value={selectedStrategy.parameters.gridSize}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    parameters: {
                      ...selectedStrategy.parameters,
                      gridSize: Number(e.target.value),
                    },
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Grid Spacing"
                type="number"
                value={selectedStrategy.parameters.gridSpacing}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    parameters: {
                      ...selectedStrategy.parameters,
                      gridSpacing: Number(e.target.value),
                    },
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Max Positions"
                type="number"
                value={selectedStrategy.parameters.maxPositions}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    parameters: {
                      ...selectedStrategy.parameters,
                      maxPositions: Number(e.target.value),
                    },
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Stop Loss"
                type="number"
                value={selectedStrategy.parameters.stopLoss}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    parameters: {
                      ...selectedStrategy.parameters,
                      stopLoss: Number(e.target.value),
                    },
                  })
                }
                margin="normal"
              />
              <TextField
                fullWidth
                label="Take Profit"
                type="number"
                value={selectedStrategy.parameters.takeProfit}
                onChange={(e) =>
                  setSelectedStrategy({
                    ...selectedStrategy,
                    parameters: {
                      ...selectedStrategy.parameters,
                      takeProfit: Number(e.target.value),
                    },
                  })
                }
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
} 