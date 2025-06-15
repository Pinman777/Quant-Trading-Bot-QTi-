import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

interface ServerStats {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  bots: number;
  networkIn: number;
  networkOut: number;
}

interface ServerStatsProps {
  stats: ServerStats;
}

const ServerStats: React.FC<ServerStatsProps> = ({ stats }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatNetworkSpeed = (bytes: number) => {
    return `${formatBytes(bytes)}/s`;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Server Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              CPU Usage
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={stats.cpu}
                color={stats.cpu > 80 ? 'error' : stats.cpu > 60 ? 'warning' : 'primary'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {stats.cpu}%
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MemoryIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Memory Usage
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={stats.memory}
                color={stats.memory > 80 ? 'error' : stats.memory > 60 ? 'warning' : 'primary'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {stats.memory}%
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <StorageIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Disk Usage
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={stats.disk}
                color={stats.disk > 80 ? 'error' : stats.disk > 60 ? 'warning' : 'primary'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {stats.disk}%
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TimerIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Uptime
            </Typography>
          </Box>
          <Typography variant="body1">{stats.uptime}</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Network In
            </Typography>
          </Box>
          <Typography variant="body1">
            {formatNetworkSpeed(stats.networkIn)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Network Out
            </Typography>
          </Box>
          <Typography variant="body1">
            {formatNetworkSpeed(stats.networkOut)}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Active Bots
            </Typography>
          </Box>
          <Typography variant="body1">{stats.bots}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServerStats; 