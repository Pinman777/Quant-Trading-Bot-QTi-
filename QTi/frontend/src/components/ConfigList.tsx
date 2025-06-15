import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  PlayArrow,
  Stop,
  Settings
} from '@mui/icons-material';
import { BotConfig } from '../types/bot';

interface ConfigListProps {
  configs: {
    id: string;
    name: string;
    config: BotConfig;
    lastModified: string;
    isActive: boolean;
  }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

export const ConfigList: React.FC<ConfigListProps> = ({
  configs,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
  onStop
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, configId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConfig(configId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConfig(null);
  };

  const handleDuplicate = () => {
    setDuplicateDialogOpen(true);
    handleMenuClose();
  };

  const handleDuplicateConfirm = () => {
    if (selectedConfig && newConfigName) {
      onDuplicate(selectedConfig);
      setDuplicateDialogOpen(false);
      setNewConfigName('');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'ma_crossover':
        return 'MA Crossover';
      case 'rsi':
        return 'RSI';
      default:
        return strategy;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bot Configurations
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Timeframe</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{getStrategyLabel(config.config.strategy)}</TableCell>
                  <TableCell>{config.config.timeframe}</TableCell>
                  <TableCell>{formatDate(config.lastModified)}</TableCell>
                  <TableCell>
                    <Chip
                      label={config.isActive ? 'Active' : 'Inactive'}
                      color={config.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={config.isActive ? 'Stop Bot' : 'Start Bot'}>
                      <IconButton
                        onClick={() =>
                          config.isActive ? onStop(config.id) : onStart(config.id)
                        }
                        color={config.isActive ? 'error' : 'success'}
                        size="small"
                      >
                        {config.isActive ? <Stop /> : <PlayArrow />}
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, config.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => selectedConfig && onEdit(selectedConfig)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDuplicate}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => selectedConfig && onDelete(selectedConfig)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={duplicateDialogOpen}
          onClose={() => setDuplicateDialogOpen(false)}
        >
          <DialogTitle>Duplicate Configuration</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="New Configuration Name"
              fullWidth
              value={newConfigName}
              onChange={(e) => setNewConfigName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDuplicateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDuplicateConfirm}
              disabled={!newConfigName}
              variant="contained"
            >
              Duplicate
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}; 