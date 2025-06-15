import React, { useState, useMemo } from 'react';
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
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import LogFilters from './LogFilters';

interface SyncLog {
  id: string;
  serverId: string;
  serverName: string;
  timestamp: string;
  status: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

interface SyncLogsProps {
  logs: SyncLog[];
  onRefresh: () => void;
  servers: Array<{ id: string; name: string }>;
}

const SyncLogs: React.FC<SyncLogsProps> = ({ logs, onRefresh, servers }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    server: 'all',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      if (
        filters.search &&
        !log.message.toLowerCase().includes(filters.search.toLowerCase()) &&
        !log.serverName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && log.status !== filters.status) {
        return false;
      }

      // Server filter
      if (filters.server !== 'all' && log.serverId !== filters.server) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(filters.dateRange.start);
        if (logDate < startDate) {
          return false;
        }
      }

      if (filters.dateRange.end) {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(filters.dateRange.end);
        if (logDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    const headers = ['Time', 'Server', 'Status', 'Message', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map((log) => [
        log.timestamp,
        log.serverName,
        log.status,
        `"${log.message}"`,
        log.details ? `"${log.details}"` : '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sync_logs_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: SyncLog['status']) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: SyncLog['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Synchronization Logs</Typography>
        <Tooltip title="Refresh Logs">
          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <LogFilters
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        servers={servers}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Server</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.serverName}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(log.status)}
                    label={log.status}
                    color={getStatusColor(log.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  {log.details && (
                    <Tooltip title={log.details}>
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SyncLogs; 