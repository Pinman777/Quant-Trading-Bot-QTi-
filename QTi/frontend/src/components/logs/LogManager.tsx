import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface LogEntry {
  id: string;
  timestamp: string;
  botId: string;
  botName: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  details?: any;
}

interface LogManagerProps {
  logs: LogEntry[];
  onRefresh: () => Promise<void>;
  onDownload: (filters: LogFilters) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

interface LogFilters {
  botId?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const LogManager: React.FC<LogManagerProps> = ({
  logs,
  onRefresh,
  onDownload,
  loading = false,
  error = null,
}) => {
  const [filters, setFilters] = useState<LogFilters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState<keyof LogEntry>('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: keyof LogEntry) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (field: keyof LogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleDownload = async () => {
    await onDownload(filters);
  };

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
  };

  const handleCloseDetails = () => {
    setSelectedLog(null);
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

  const filteredLogs = logs
    .filter((log) => {
      if (filters.botId && log.botId !== filters.botId) return false;
      if (filters.level && log.level !== filters.level) return false;
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
      if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Bot Logs</Typography>
        <Box>
          <Tooltip title="Show Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Logs">
            <IconButton onClick={onRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}
          >
            Download Logs
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: filters.search && (
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Log Level</InputLabel>
                <Select
                  value={filters.level || ''}
                  label="Log Level"
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ERROR">Error</MenuItem>
                  <MenuItem value="WARNING">Warning</MenuItem>
                  <MenuItem value="INFO">Info</MenuItem>
                  <MenuItem value="DEBUG">Debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'botName'}
                  direction={orderBy === 'botName' ? order : 'asc'}
                  onClick={() => handleSort('botName')}
                >
                  Bot
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'level'}
                  direction={orderBy === 'level' ? order : 'asc'}
                  onClick={() => handleSort('level')}
                >
                  Level
                </TableSortLabel>
              </TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.botName}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.level}
                      color={getLevelColor(log.level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(log)}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog
        open={!!selectedLog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>
              Log Details
              <Chip
                label={selectedLog.level}
                color={getLevelColor(selectedLog.level)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Timestamp</Typography>
                  <Typography>{new Date(selectedLog.timestamp).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Bot</Typography>
                  <Typography>{selectedLog.botName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Message</Typography>
                  <Typography>{selectedLog.message}</Typography>
                </Grid>
                {selectedLog.details && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Details</Typography>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LogManager; 