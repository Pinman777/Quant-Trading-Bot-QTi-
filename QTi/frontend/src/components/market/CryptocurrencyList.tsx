import React, { useEffect, useState } from 'react';
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
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { coinMarketCapService, Cryptocurrency } from '../../services/coinmarketcap';

interface CryptocurrencyListProps {
  onSelect?: (cryptocurrency: Cryptocurrency) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPercentage = (num: number): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const CryptocurrencyList: React.FC<CryptocurrencyListProps> = ({ onSelect }) => {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchCryptocurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coinMarketCapService.getCryptocurrencies({
        start: page * rowsPerPage + 1,
        limit: rowsPerPage,
        sort: sortBy,
        sort_dir: sortDir,
      });
      setCryptocurrencies(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrencies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptocurrencies();
  }, [page, rowsPerPage, sortBy, sortDir]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const filteredCryptocurrencies = cryptocurrencies.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Cryptocurrencies</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="market_cap">Market Cap</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="volume_24h">Volume 24h</MenuItem>
              <MenuItem value="percent_change_24h">Change 24h</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCryptocurrencies} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">24h %</TableCell>
              <TableCell align="right">7d %</TableCell>
              <TableCell align="right">Market Cap</TableCell>
              <TableCell align="right">Volume (24h)</TableCell>
              <TableCell align="right">Circulating Supply</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              filteredCryptocurrencies.map((crypto) => (
                <TableRow
                  key={crypto.id}
                  hover
                  onClick={() => onSelect?.(crypto)}
                  sx={{ cursor: onSelect ? 'pointer' : 'default' }}
                >
                  <TableCell>{crypto.cmc_rank}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {crypto.name}
                      </Typography>
                      <Chip
                        label={crypto.symbol}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {crypto.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(crypto.quote.USD.price)}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      color={
                        crypto.quote.USD.percent_change_24h >= 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {crypto.quote.USD.percent_change_24h >= 0 ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {formatPercentage(crypto.quote.USD.percent_change_24h)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      color={
                        crypto.quote.USD.percent_change_7d >= 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {crypto.quote.USD.percent_change_7d >= 0 ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {formatPercentage(crypto.quote.USD.percent_change_7d)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(crypto.quote.USD.market_cap)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(crypto.quote.USD.volume_24h)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(crypto.circulating_supply)} {crypto.symbol}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default CryptocurrencyList; 