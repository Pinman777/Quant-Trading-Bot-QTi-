import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

interface MarketData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  lastUpdated: string;
}

interface MarketDataProps {
  onRefresh: () => Promise<void>;
  onFavorite: (symbol: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const MarketData: React.FC<MarketDataProps> = ({
  onRefresh,
  onFavorite,
  loading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 50000,
      change24h: 2.5,
      volume24h: 25000000000,
      marketCap: 1000000000000,
      rank: 1,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3000,
      change24h: -1.2,
      volume24h: 15000000000,
      marketCap: 350000000000,
      rank: 2,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Implement API call to fetch market data
        // const response = await fetch('/api/market-data');
        // const data = await response.json();
        // setMarketData(data);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFavorite = async (symbol: string) => {
    try {
      await onFavorite(symbol);
      setFavorites((prev) =>
        prev.includes(symbol)
          ? prev.filter((s) => s !== symbol)
          : [...prev, symbol]
      );
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const filteredData = marketData.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Market Data</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            placeholder="Search by symbol or name..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">24h Change</TableCell>
                  <TableCell align="right">24h Volume</TableCell>
                  <TableCell align="right">Market Cap</TableCell>
                  <TableCell align="right">Last Updated</TableCell>
                  <TableCell align="center">Favorite</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.rank}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                          {item.symbol}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        icon={
                          item.change24h >= 0 ? (
                            <TrendingUpIcon />
                          ) : (
                            <TrendingDownIcon />
                          )
                        }
                        label={formatPercentage(item.change24h)}
                        color={item.change24h >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.volume24h)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.marketCap)}</TableCell>
                    <TableCell align="right">
                      {new Date(item.lastUpdated).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleFavorite(item.symbol)}
                        color={favorites.includes(item.symbol) ? 'primary' : 'default'}
                      >
                        {favorites.includes(item.symbol) ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top Gainers & Losers
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      Top Gainers
                    </Typography>
                    {marketData
                      .filter((item) => item.change24h > 0)
                      .sort((a, b) => b.change24h - a.change24h)
                      .slice(0, 3)
                      .map((item) => (
                        <Box key={item.id} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {item.symbol}: {formatPercentage(item.change24h)}
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      Top Losers
                    </Typography>
                    {marketData
                      .filter((item) => item.change24h < 0)
                      .sort((a, b) => a.change24h - b.change24h)
                      .slice(0, 3)
                      .map((item) => (
                        <Box key={item.id} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {item.symbol}: {formatPercentage(item.change24h)}
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default MarketData; 