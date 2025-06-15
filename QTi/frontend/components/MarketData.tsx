import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface MarketData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  percent_change_24h: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  last_updated: string;
}

const MarketData: React.FC = () => {
  const theme = useTheme();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/market/overview');
      if (!response.ok) throw new Error('Failed to fetch market data');
      const data = await response.json();
      setMarketData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Обновляем данные каждые 5 минут
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = marketData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercent = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Market Overview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastUpdate && (
            <Typography variant="body2" color="textSecondary">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton onClick={fetchMarketData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or symbol..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">24h Change</TableCell>
                <TableCell align="right">Market Cap</TableCell>
                <TableCell align="right">Volume (24h)</TableCell>
                <TableCell align="right">Circulating Supply</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{item.name}</Typography>
                      <Chip
                        label={item.symbol}
                        size="small"
                        sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(item.price)}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        color: item.percent_change_24h >= 0
                          ? theme.palette.success.main
                          : theme.palette.error.main
                      }}
                    >
                      {item.percent_change_24h >= 0 ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      {formatPercent(item.percent_change_24h)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(item.market_cap)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(item.volume_24h)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={item.circulating_supply.toString()}>
                      <span>{formatLargeNumber(item.circulating_supply)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default MarketData; 