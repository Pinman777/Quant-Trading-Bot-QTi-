import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { coinMarketCapService, GlobalMetrics } from '../../services/coinmarketcap';

const formatNumber = (num: number): string => {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

const formatPercentage = (num: number): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  tooltip?: string;
}> = ({ title, value, change, tooltip }) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Box display="flex" alignItems="center" mb={1}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {value}
      </Typography>
      {change !== undefined && (
        <Box
          display="flex"
          alignItems="center"
          color={change >= 0 ? 'success.main' : 'error.main'}
        >
          {change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {formatPercentage(change)}
          </Typography>
        </Box>
      )}
    </Box>
    {tooltip && (
      <Typography variant="caption" color="text.secondary">
        {tooltip}
      </Typography>
    )}
  </Paper>
);

const GlobalMetricsComponent: React.FC = () => {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coinMarketCapService.getGlobalMetrics({});
      setMetrics(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Обновление каждую минуту
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Global Market Metrics</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchMetrics} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Market Cap"
            value={`$${formatNumber(metrics.total_market_cap)}`}
            change={metrics.total_market_cap_yesterday_percentage_change}
            tooltip={`Yesterday: $${formatNumber(metrics.total_market_cap_yesterday)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="24h Volume"
            value={`$${formatNumber(metrics.total_volume_24h)}`}
            change={metrics.total_volume_24h_yesterday_percentage_change}
            tooltip={`Yesterday: $${formatNumber(metrics.total_volume_24h_yesterday)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="BTC Dominance"
            value={`${metrics.btc_dominance.toFixed(2)}%`}
            change={metrics.btc_dominance_24h_percentage_change}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="ETH Dominance"
            value={`${metrics.eth_dominance.toFixed(2)}%`}
            change={metrics.eth_dominance_24h_percentage_change}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Cryptocurrencies"
            value={metrics.active_cryptocurrencies.toString()}
            tooltip={`Total: ${metrics.total_cryptocurrencies}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Exchanges"
            value={metrics.active_exchanges.toString()}
            tooltip={`Total: ${metrics.total_exchanges}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="DeFi Market Cap"
            value={`$${formatNumber(metrics.defi_market_cap)}`}
            change={metrics.defi_24h_percentage_change}
            tooltip={`24h Volume: $${formatNumber(metrics.defi_volume_24h)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Stablecoin Market Cap"
            value={`$${formatNumber(metrics.stablecoin_market_cap)}`}
            change={metrics.stablecoin_24h_percentage_change}
            tooltip={`24h Volume: $${formatNumber(metrics.stablecoin_volume_24h)}`}
          />
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Last updated: {new Date(metrics.last_updated).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default GlobalMetricsComponent; 