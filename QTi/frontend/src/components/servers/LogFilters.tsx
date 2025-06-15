import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';

interface LogFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    server: string;
    dateRange: { start: string; end: string };
  }) => void;
  onExport: () => void;
  servers: Array<{ id: string; name: string }>;
}

const LogFilters: React.FC<LogFiltersProps> = ({
  onFilterChange,
  onExport,
  servers,
}) => {
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    server: 'all',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      server: 'all',
      dateRange: {
        start: '',
        end: '',
      },
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        label="Search"
        value={filters.search}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        placeholder="Search in logs..."
        sx={{ minWidth: 200 }}
      />

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="success">Success</MenuItem>
          <MenuItem value="error">Error</MenuItem>
          <MenuItem value="info">Info</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Server</InputLabel>
        <Select
          value={filters.server}
          label="Server"
          onChange={(e) => handleFilterChange('server', e.target.value)}
        >
          <MenuItem value="all">All Servers</MenuItem>
          {servers.map((server) => (
            <MenuItem key={server.id} value={server.id}>
              {server.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Start Date"
        type="datetime-local"
        value={filters.dateRange.start}
        onChange={(e) => handleDateChange('start', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 200 }}
      />

      <TextField
        size="small"
        label="End Date"
        type="datetime-local"
        value={filters.dateRange.end}
        onChange={(e) => handleDateChange('end', e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 200 }}
      />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Clear Filters">
          <IconButton onClick={handleClearFilters} size="small">
            <ClearIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export Logs">
          <IconButton onClick={onExport} size="small">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default LogFilters; 