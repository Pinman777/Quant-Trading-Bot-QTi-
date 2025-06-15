import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
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

interface Trade {
  id: string;
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  value: number;
  fee: number;
  pnl: number;
  status: 'completed' | 'cancelled' | 'failed';
}

interface BotHistoryProps {
  botId: string;
  trades: Trade[];
  onRefresh: () => Promise<void>;
  onExport: () => Promise<void>;
  onFilter: (filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

const BotHistory: React.FC<BotHistoryProps> = ({
  botId,
  trades,
  onRefresh,
  onExport,
  onFilter,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await onRefresh();
    } catch (err) {
      setError('Failed to refresh trade history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      await onExport();
    } catch (err) {
      setError('Failed to export trade history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || trade.type === filters.type;
    const matchesStatus = !filters.status || trade.status === filters.status;
    const matchesDate = (!filters.startDate || new Date(trade.timestamp) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(trade.timestamp) <= new Date(filters.endDate));
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const chartData = {
    labels: filteredTrades.map((trade) => new Date(trade.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'PnL',
        data: filteredTrades.map((trade) => trade.pnl),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'PnL History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Trade History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="buy">Buy</MenuItem>
              <MenuItem value="sell">Sell</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Date Range"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Line data={chartData} options={chartOptions} />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Fee</TableCell>
              <TableCell align="right">PnL</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.id}</TableCell>
                <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={trade.type}
                    color={trade.type === 'buy' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">${formatNumber(trade.price)}</TableCell>
                <TableCell align="right">{formatNumber(trade.quantity)}</TableCell>
                <TableCell align="right">${formatNumber(trade.value)}</TableCell>
                <TableCell align="right">${formatNumber(trade.fee)}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: trade.pnl >= 0 ? 'success.main' : 'error.main' }}
                >
                  ${formatNumber(trade.pnl)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={trade.status}
                    color={
                      trade.status === 'completed'
                        ? 'success'
                        : trade.status === 'cancelled'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BotHistory; 