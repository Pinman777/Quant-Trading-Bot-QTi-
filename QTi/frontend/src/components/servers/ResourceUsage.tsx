import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface ResourceData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
}

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  lastSync: string;
  configPath: string;
  stats: {
    cpu: number;
    memory: number;
    disk: number;
    networkIn: number;
    networkOut: number;
    uptime: number;
  };
}

interface ResourceUsageProps {
  server: Server;
  history: ResourceData[];
  onRefresh: (serverId: string) => void;
}

const ResourceUsage: React.FC<ResourceUsageProps> = ({ server, history, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('1h');

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatNetworkSpeed = (bytes: number) => {
    return `${formatBytes(bytes)}/s`;
  };

  const chartData = {
    labels: history.map((h) => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: history.map((h) => h.cpu),
        borderColor: '#1A2B44',
        backgroundColor: 'rgba(26, 43, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Memory Usage (%)',
        data: history.map((h) => h.memory),
        borderColor: '#00C4B4',
        backgroundColor: 'rgba(0, 196, 180, 0.1)',
        fill: true,
      },
      {
        label: 'Disk Usage (%)',
        data: history.map((h) => h.disk),
        borderColor: '#FF5252',
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        fill: true,
      },
    ],
  };

  const networkData = {
    labels: history.map((h) => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Network In',
        data: history.map((h) => h.networkIn),
        borderColor: '#1A2B44',
        backgroundColor: 'rgba(26, 43, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Network Out',
        data: history.map((h) => h.networkOut),
        borderColor: '#00C4B4',
        backgroundColor: 'rgba(0, 196, 180, 0.1)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const networkOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => formatBytes(value),
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {server.name} Resource Usage
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={() => onRefresh(server.id)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                CPU Usage
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon color="primary" />
                {server.stats.cpu.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Memory Usage
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryIcon color="primary" />
                {server.stats.memory.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Network In
              </Typography>
              <Typography variant="h6">
                {formatNetworkSpeed(server.stats.networkIn)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Network Out
              </Typography>
              <Typography variant="h6">
                {formatNetworkSpeed(server.stats.networkOut)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ height: 300 }}>
            <Line data={networkData} options={networkOptions} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Disk Usage
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon color="primary" />
                {server.stats.disk.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ResourceUsage; 