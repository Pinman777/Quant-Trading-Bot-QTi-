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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface Bot {
  id: string;
  name: string;
  configId: string;
  status: 'running' | 'stopped' | 'error';
  exchange: string;
  symbol: string;
  strategy: string;
  pnl: number;
  winRate: number;
  trades: number;
  equity: number;
  drawdown: number;
  lastUpdate: string;
}

interface BotManagerProps {
  bots: Bot[];
  configs: Array<{ id: string; name: string }>;
  onAddBot: (configId: string) => Promise<void>;
  onDeleteBot: (id: string) => Promise<void>;
  onStartBot: (id: string) => Promise<void>;
  onStopBot: (id: string) => Promise<void>;
  onRefreshBot: (id: string) => Promise<void>;
  onViewHistory: (id: string) => void;
  onViewSettings: (id: string) => void;
}

const BotManager: React.FC<BotManagerProps> = ({
  bots,
  configs,
  onAddBot,
  onDeleteBot,
  onStartBot,
  onStopBot,
  onRefreshBot,
  onViewHistory,
  onViewSettings,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedConfig('');
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedConfig('');
    setError(null);
  };

  const handleAddBot = async () => {
    if (!selectedConfig) return;
    try {
      setLoading(true);
      setError(null);
      await onAddBot(selectedConfig);
      handleCloseDialog();
    } catch (err) {
      setError('Failed to add bot');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Bot Management</Typography>
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={handleOpenDialog}
        >
          Add Bot
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Exchange</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell align="right">PnL</TableCell>
              <TableCell align="right">Win Rate</TableCell>
              <TableCell align="right">Trades</TableCell>
              <TableCell align="right">Equity</TableCell>
              <TableCell align="right">Drawdown</TableCell>
              <TableCell align="right">Last Update</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bots.map((bot) => (
              <TableRow key={bot.id}>
                <TableCell>{bot.name}</TableCell>
                <TableCell>
                  <Chip
                    label={bot.status}
                    color={getStatusColor(bot.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{bot.exchange}</TableCell>
                <TableCell>{bot.symbol}</TableCell>
                <TableCell>{bot.strategy}</TableCell>
                <TableCell align="right" sx={{ color: bot.pnl >= 0 ? 'success.main' : 'error.main' }}>
                  {formatNumber(bot.pnl)}%
                </TableCell>
                <TableCell align="right">{formatNumber(bot.winRate)}%</TableCell>
                <TableCell align="right">{bot.trades}</TableCell>
                <TableCell align="right">${formatNumber(bot.equity)}</TableCell>
                <TableCell align="right" sx={{ color: bot.drawdown > 20 ? 'error.main' : 'warning.main' }}>
                  {formatNumber(bot.drawdown)}%
                </TableCell>
                <TableCell align="right">
                  {new Date(bot.lastUpdate).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title={bot.status === 'running' ? 'Stop Bot' : 'Start Bot'}>
                      <IconButton
                        size="small"
                        onClick={() => (bot.status === 'running' ? onStopBot(bot.id) : onStartBot(bot.id))}
                        color={bot.status === 'running' ? 'error' : 'success'}
                      >
                        {bot.status === 'running' ? <StopIcon /> : <PlayIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                      <IconButton
                        size="small"
                        onClick={() => onRefreshBot(bot.id)}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        onClick={() => onViewHistory(bot.id)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Settings">
                      <IconButton
                        size="small"
                        onClick={() => onViewSettings(bot.id)}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Bot">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteBot(bot.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Configuration</InputLabel>
              <Select
                value={selectedConfig}
                label="Configuration"
                onChange={(e) => setSelectedConfig(e.target.value)}
              >
                {configs.map((config) => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddBot}
            variant="contained"
            disabled={loading || !selectedConfig}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BotManager; 