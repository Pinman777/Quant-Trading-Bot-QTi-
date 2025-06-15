import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Button,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useWebSocket, BotStatus as WebSocketBotStatus } from './WebSocketProvider';
import { useTheme } from '@mui/material/styles';

interface BotStatus extends WebSocketBotStatus {
  lastUpdate?: string;
}

interface BotStatusCardProps {
  bot: BotStatus;
  onAction: (action: string, botName: string) => void;
}

export const BotStatusCard: React.FC<BotStatusCardProps> = ({ bot, onAction }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const getStatusColor = (status: BotStatus['status']) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'error';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    onAction(action, bot.name);
    handleMenuClose();
  };

  const formatUptime = (uptime: number | null) => {
    if (!uptime) return 'N/A';
    const hours = Math.floor(uptime);
    const minutes = Math.floor((uptime - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastUpdate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" noWrap>
            {bot.name}
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => handleAction('refresh')}
              sx={{ mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleMenuClick}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={bot.status}
            color={getStatusColor(bot.status)}
            size="small"
            sx={{ mr: 1 }}
          />
          {bot.error && (
            <Tooltip title={bot.error}>
              <Chip
                label="Error"
                color="error"
                size="small"
              />
            </Tooltip>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              PID
            </Typography>
            <Typography variant="body1">
              {bot.pid || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Uptime
            </Typography>
            <Typography variant="body1">
              {formatUptime(bot.uptime)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Balance
            </Typography>
            <Typography variant="body1">
              {bot.balance ? `$${bot.balance.toFixed(2)}` : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Trades
            </Typography>
            <Typography variant="body1">
              {bot.trades || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Profit
            </Typography>
            <Typography
              variant="body1"
              color={bot.profit && bot.profit > 0 ? 'success.main' : 'error.main'}
            >
              {bot.profit ? `$${bot.profit.toFixed(2)}` : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Last Update
            </Typography>
            <Typography variant="body1">
              {formatLastUpdate(bot.lastUpdate)}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color={bot.status === 'running' ? 'error' : 'success'}
            startIcon={bot.status === 'running' ? <StopIcon /> : <PlayIcon />}
            onClick={() => handleAction(bot.status === 'running' ? 'stop' : 'start')}
            fullWidth
          >
            {bot.status === 'running' ? 'Stop' : 'Start'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => handleAction('settings')}
            fullWidth
          >
            Settings
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('logs')}>View Logs</MenuItem>
        <MenuItem onClick={() => handleAction('config')}>Edit Config</MenuItem>
        <MenuItem onClick={() => handleAction('restart')}>Restart</MenuItem>
        <MenuItem onClick={() => handleAction('delete')}>Delete</MenuItem>
      </Menu>
    </Card>
  );
};

export const BotStatusList: React.FC = () => {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const { botStatuses } = useWebSocket();

  useEffect(() => {
    const updatedBots = Object.entries(botStatuses).map(([name, status]) => ({
      ...status,
      name,
      lastUpdate: new Date().toISOString(),
    }));
    setBots(updatedBots);
  }, [botStatuses]);

  const handleBotAction = (action: string, botName: string) => {
    // Здесь будет логика обработки действий с ботом
    console.log(`Action ${action} for bot ${botName}`);
  };

  return (
    <Grid container spacing={2}>
      {bots.map((bot) => (
        <Grid item xs={12} sm={6} md={4} key={bot.name}>
          <BotStatusCard bot={bot} onAction={handleBotAction} />
        </Grid>
      ))}
    </Grid>
  );
}; 