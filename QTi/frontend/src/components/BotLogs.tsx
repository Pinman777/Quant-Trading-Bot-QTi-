import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  botId: string;
}

interface BotLogsProps {
  botId: string;
  autoScroll?: boolean;
}

const BotLogs: React.FC<BotLogsProps> = ({ botId, autoScroll = true }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [level, setLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [botId]);

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/logs/download`);
      if (!response.ok) {
        throw new Error('Failed to download logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-${botId}-logs.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleClear = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/logs`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }

      setLogs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'info';
      case 'DEBUG':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter
      ? log.message.toLowerCase().includes(filter.toLowerCase())
      : true;
    const matchesLevel = level === 'ALL' || log.level === level;
    return matchesFilter && matchesLevel;
  });

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Bot Logs</Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchLogs} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear">
              <IconButton onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Log Level</InputLabel>
              <Select
                value={level}
                label="Log Level"
                onChange={(e) => setLevel(e.target.value)}
              >
                <MenuItem value="ALL">All Levels</MenuItem>
                <MenuItem value="ERROR">Error</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="DEBUG">Debug</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {filteredLogs.map((log, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 1,
                '&:last-child': { mb: 0 }
              }}
            >
              <Chip
                label={log.level}
                size="small"
                color={getLevelColor(log.level)}
                sx={{ mr: 1, minWidth: 80 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  component="span"
                  sx={{ color: 'text.secondary', mr: 1 }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
                <Typography component="span">{log.message}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={logsEndRef} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BotLogs; 