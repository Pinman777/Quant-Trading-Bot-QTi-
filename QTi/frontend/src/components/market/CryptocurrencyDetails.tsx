import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { coinMarketCapService, Cryptocurrency } from '../../services/coinmarketcap';

interface CryptocurrencyDetailsProps {
  cryptocurrency: Cryptocurrency;
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

const CryptocurrencyDetails: React.FC<CryptocurrencyDetailsProps> = ({ cryptocurrency }) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coinMarketCapService.getHistoricalData({
        id: cryptocurrency.id,
        interval: timeframe === '1D' ? '1h' : '1d',
        count: timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365,
      });
      setHistoricalData(response.data.quotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [cryptocurrency.id, timeframe]);

  useEffect(() => {
    if (chartContainerRef.current && historicalData.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      const data = historicalData.map((quote) => ({
        time: new Date(quote.timestamp).getTime() / 1000,
        open: quote.quote.USD.price,
        high: quote.quote.USD.price,
        low: quote.quote.USD.price,
        close: quote.quote.USD.price,
      }));

      candlestickSeries.setData(data);
      chart.timeScale().fitContent();

      chartRef.current = chart;

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [historicalData]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {cryptocurrency.name} ({cryptocurrency.symbol})
          </Typography>
          <Box display="flex" gap={1}>
            {cryptocurrency.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <ButtonGroup size="small">
            <Button
              variant={timeframe === '1D' ? 'contained' : 'outlined'}
              onClick={() => setTimeframe('1D')}
            >
              1D
            </Button>
            <Button
              variant={timeframe === '1W' ? 'contained' : 'outlined'}
              onClick={() => setTimeframe('1W')}
            >
              1W
            </Button>
            <Button
              variant={timeframe === '1M' ? 'contained' : 'outlined'}
              onClick={() => setTimeframe('1M')}
            >
              1M
            </Button>
            <Button
              variant={timeframe === '3M' ? 'contained' : 'outlined'}
              onClick={() => setTimeframe('3M')}
            >
              3M
            </Button>
            <Button
              variant={timeframe === '1Y' ? 'contained' : 'outlined'}
              onClick={() => setTimeframe('1Y')}
            >
              1Y
            </Button>
          </ButtonGroup>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchHistoricalData} disabled={loading}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box ref={chartContainerRef} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Price Information
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Current Price</Typography>
                  <Typography variant="h6">
                    {formatNumber(cryptocurrency.quote.USD.price)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">24h Change</Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    color={
                      cryptocurrency.quote.USD.percent_change_24h >= 0
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    {cryptocurrency.quote.USD.percent_change_24h >= 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {formatPercentage(cryptocurrency.quote.USD.percent_change_24h)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">7d Change</Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    color={
                      cryptocurrency.quote.USD.percent_change_7d >= 0
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    {cryptocurrency.quote.USD.percent_change_7d >= 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {formatPercentage(cryptocurrency.quote.USD.percent_change_7d)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Market Information
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Market Cap</Typography>
                  <Typography>
                    {formatNumber(cryptocurrency.quote.USD.market_cap)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">24h Volume</Typography>
                  <Typography>
                    {formatNumber(cryptocurrency.quote.USD.volume_24h)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Circulating Supply</Typography>
                  <Typography>
                    {formatNumber(cryptocurrency.circulating_supply)} {cryptocurrency.symbol}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Total Supply</Typography>
                  <Typography>
                    {formatNumber(cryptocurrency.total_supply)} {cryptocurrency.symbol}
                  </Typography>
                </Box>
                {cryptocurrency.max_supply && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Max Supply</Typography>
                    <Typography>
                      {formatNumber(cryptocurrency.max_supply)} {cryptocurrency.symbol}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            {cryptocurrency.platform && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Platform Information
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Platform</Typography>
                    <Typography>{cryptocurrency.platform.name}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Token Address</Typography>
                    <Typography
                      sx={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cryptocurrency.platform.token_address}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Last updated: {new Date(cryptocurrency.last_updated).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default CryptocurrencyDetails; 