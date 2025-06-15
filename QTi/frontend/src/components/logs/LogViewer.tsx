import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

interface LogViewerProps {
  logs: LogEntry[];
  onRefresh: () => Promise<void>;
  onDownload: () => Promise<void>;
  onClear: () => Promise<void>;
  loading?: boolean;
  error?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  onRefresh,
  onDownload,
  onClear,
  loading = false,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const sources = Array.from(new Set(logs.map((log) => log.source)));

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'DEBUG':
        return 'info';
      case 'INFO':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesSource = selectedSource === 'ALL' || log.source === selectedSource;
    return matchesSearch && matchesLevel && matchesSource;
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLevel(event.target.value as string);
  };

  const handleSourceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSource(event.target.value as string);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('ALL');
    setSelectedSource('ALL');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">System Logs</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => onRefresh()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={() => onDownload()} disabled={loading}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton onClick={() => onClear()} disabled={loading}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Level</InputLabel>
            <Select
              value={selectedLevel}
              onChange={handleLevelChange}
              label="Level"
            >
              <MenuItem value="ALL">All Levels</MenuItem>
              <MenuItem value="DEBUG">Debug</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Source</InputLabel>
            <Select
              value={selectedSource}
              onChange={handleSourceChange}
              label="Source"
            >
              <MenuItem value="ALL">All Sources</MenuItem>
              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<FilterIcon />}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      <Paper
        ref={logContainerRef}
        sx={{
          height: '600px',
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : filteredLogs.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">No logs found</Typography>
          </Box>
        ) : (
          filteredLogs.map((log) => (
            <Box
              key={log.id}
              sx={{
                mb: 1,
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box display="flex" alignItems="center" mb={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
                <Chip
                  label={log.level}
                  color={getLevelColor(log.level)}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  {log.source}
                </Typography>
              </Box>
              <Typography variant="body2">{log.message}</Typography>
              {log.metadata && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="pre"
                  sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </Typography>
              )}
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default LogViewer; 