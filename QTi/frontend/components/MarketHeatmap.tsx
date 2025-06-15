import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MarketHeatmapProps {
  timeframe?: string;
}

interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ timeframe = '24h' }) => {
  const theme = useTheme();
  const [data, setData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'marketCap' | 'volume' | 'change'>('marketCap');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/market/overview');
        if (!response.ok) throw new Error('Failed to fetch market data');
        const marketData = await response.json();
        setData(marketData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getColor = (change: number) => {
    if (change > 5) return theme.palette.success.light;
    if (change > 0) return theme.palette.success.main;
    if (change > -5) return theme.palette.error.main;
    return theme.palette.error.dark;
  };

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'marketCap':
        return b.marketCap - a.marketCap;
      case 'volume':
        return b.volume24h - a.volume24h;
      case 'change':
        return b.change24h - a.change24h;
      default:
        return 0;
    }
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Market Overview
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <MenuItem value="marketCap">Market Cap</MenuItem>
                <MenuItem value="volume">Volume</MenuItem>
                <MenuItem value="change">24h Change</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

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
        <Grid container spacing={1}>
          {sortedData.map((coin) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={coin.symbol}>
              <Paper
                sx={{
                  p: 1,
                  backgroundColor: getColor(coin.change24h),
                  color: theme.palette.getContrastText(getColor(coin.change24h)),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 1,
                  },
                }}
              >
                <Typography variant="subtitle2" noWrap>
                  {coin.symbol}
                </Typography>
                <Typography variant="body2" noWrap>
                  ${coin.price.toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: coin.change24h >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  }}
                >
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default MarketHeatmap; 