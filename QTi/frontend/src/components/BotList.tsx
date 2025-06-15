import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Grid,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Bot } from '../services/bot';

interface BotListProps {
  bots: Bot[];
  onAction: (botId: string, action: 'start' | 'stop') => void;
  onRefresh: () => void;
  loading?: boolean;
}

const BotList: React.FC<BotListProps> = ({
  bots,
  onAction,
  onRefresh,
  loading = false
}) => {
  const theme = useTheme();
  const router = useRouter();

  const getStatusColor = (status: Bot['status']) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'error':
        return 'error';
      case 'stopped':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Bots</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Grid container spacing={2}>
          {bots.map((bot) => (
            <Grid item xs={12} key={bot.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{bot.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bot.exchange} - {bot.symbol}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={bot.status}
                        color={getStatusColor(bot.status)}
                        size="small"
                      />
                      <Tooltip title={bot.status === 'running' ? 'Stop' : 'Start'}>
                        <IconButton
                          size="small"
                          onClick={() => onAction(bot.id, bot.status === 'running' ? 'stop' : 'start')}
                        >
                          {bot.status === 'running' ? <StopIcon /> : <PlayIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Settings">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/bots/${bot.id}`)}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        PnL
                      </Typography>
                      <Typography
                        variant="body1"
                        color={bot.pnl >= 0 ? 'success.main' : 'error.main'}
                      >
                        {bot.pnl.toFixed(2)} ({bot.pnlPercent.toFixed(2)}%)
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Open Positions
                      </Typography>
                      <Typography variant="body1">
                        {bot.openPositions}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades
                      </Typography>
                      <Typography variant="body1">
                        {bot.totalTrades}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="body1">
                        {bot.winRate.toFixed(2)}%
                      </Typography>
                    </Grid>
                  </Grid>
                  {bot.error && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="error">
                        Error: {bot.error}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BotList; 