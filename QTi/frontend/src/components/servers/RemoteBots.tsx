import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface RemoteBot {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  exchange: string;
  symbol: string;
  strategy: string;
  config: {
    timeframe: string;
    leverage: number;
    positionSize: number;
    stopLoss: number;
    takeProfit: number;
  };
}

interface RemoteBotsProps {
  bots: RemoteBot[];
  onStart: (botId: string) => void;
  onStop: (botId: string) => void;
  onDelete: (botId: string) => void;
  onRefresh: () => void;
}

const RemoteBots: React.FC<RemoteBotsProps> = ({
  bots,
  onStart,
  onStop,
  onDelete,
  onRefresh,
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Remote Bots</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Exchange</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Strategy</TableCell>
              <TableCell>Timeframe</TableCell>
              <TableCell>Leverage</TableCell>
              <TableCell>Position Size</TableCell>
              <TableCell>Stop Loss</TableCell>
              <TableCell>Take Profit</TableCell>
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
                    color={bot.status === 'running' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{bot.exchange}</TableCell>
                <TableCell>{bot.symbol}</TableCell>
                <TableCell>{bot.strategy}</TableCell>
                <TableCell>{bot.config.timeframe}</TableCell>
                <TableCell>{bot.config.leverage}x</TableCell>
                <TableCell>{bot.config.positionSize}%</TableCell>
                <TableCell>{bot.config.stopLoss}%</TableCell>
                <TableCell>{bot.config.takeProfit}%</TableCell>
                <TableCell align="right">
                  {bot.status === 'running' ? (
                    <Tooltip title="Stop Bot">
                      <IconButton
                        onClick={() => onStop(bot.id)}
                        size="small"
                        color="error"
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Start Bot">
                      <IconButton
                        onClick={() => onStart(bot.id)}
                        size="small"
                        color="success"
                      >
                        <StartIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete Bot">
                    <IconButton
                      onClick={() => onDelete(bot.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RemoteBots; 