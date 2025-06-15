import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { exchangeService } from '../../services/exchange';

interface Exchange {
  name: string;
  supported_markets: string[];
  has_testnet: boolean;
  max_leverage: number;
  min_order_size: number;
  trading_fees: {
    maker: number;
    taker: number;
  };
  supported_timeframes: string[];
  supported_order_types: string[];
}

interface ExchangeConfig {
  api_key: string;
  api_secret: string;
  testnet: boolean;
}

interface ExchangeStatus {
  is_connected: boolean;
  last_update: number;
  error?: string;
}

export const ExchangeManager: React.FC = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [configs, setConfigs] = useState<Record<string, ExchangeConfig>>({});
  const [statuses, setStatuses] = useState<Record<string, ExchangeStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState<ExchangeConfig>({
    api_key: '',
    api_secret: '',
    testnet: false
  });

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load supported exchanges
      const supportedExchanges = await exchangeService.getSupportedExchanges();
      setExchanges(supportedExchanges);

      // Load configurations and statuses for each exchange
      const newConfigs: Record<string, ExchangeConfig> = {};
      const newStatuses: Record<string, ExchangeStatus> = {};

      for (const exchange of supportedExchanges) {
        try {
          const config = await exchangeService.getExchangeConfig(exchange.name);
          newConfigs[exchange.name] = config;
        } catch {
          // Exchange not configured
        }

        try {
          const status = await exchangeService.getExchangeStatus(exchange.name);
          newStatuses[exchange.name] = status;
        } catch {
          // Status not available
        }
      }

      setConfigs(newConfigs);
      setStatuses(newStatuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchanges');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeSelect = (exchange: string) => {
    setSelectedExchange(exchange);
  };

  const handleDialogOpen = (exchange: string) => {
    setSelectedExchange(exchange);
    setNewConfig({
      api_key: configs[exchange]?.api_key || '',
      api_secret: configs[exchange]?.api_secret || '',
      testnet: configs[exchange]?.testnet || false
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedExchange(null);
  };

  const handleConfigChange = (field: keyof ExchangeConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewConfig({
      ...newConfig,
      [field]: field === 'testnet' ? event.target.checked : event.target.value
    });
  };

  const handleConfigSave = async () => {
    if (!selectedExchange) return;

    try {
      setError(null);

      // Test connection first
      const testResult = await exchangeService.testConnection(
        selectedExchange,
        newConfig
      );

      if (!testResult.is_connected) {
        setError('Failed to connect to exchange. Please check your credentials.');
        return;
      }

      // Save configuration
      await exchangeService.updateExchangeConfig(selectedExchange, newConfig);

      // Update local state
      setConfigs({
        ...configs,
        [selectedExchange]: newConfig
      });

      // Update status
      const status = await exchangeService.getExchangeStatus(selectedExchange);
      setStatuses({
        ...statuses,
        [selectedExchange]: status
      });

      handleDialogClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {exchanges.map((exchange) => (
          <Grid item xs={12} sm={6} md={4} key={exchange.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {exchange.name.toUpperCase()}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Supported Markets: {exchange.supported_markets.join(', ')}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Max Leverage: {exchange.max_leverage}x
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Min Order Size: {exchange.min_order_size}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Trading Fees: {exchange.trading_fees.maker * 100}% maker /{' '}
                  {exchange.trading_fees.taker * 100}% taker
                </Typography>

                {statuses[exchange.name] && (
                  <Box mt={1}>
                    <Typography
                      variant="body2"
                      color={statuses[exchange.name].is_connected ? 'success.main' : 'error.main'}
                    >
                      Status: {statuses[exchange.name].is_connected ? 'Connected' : 'Disconnected'}
                    </Typography>
                    {statuses[exchange.name].error && (
                      <Typography variant="body2" color="error.main">
                        Error: {statuses[exchange.name].error}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleDialogOpen(exchange.name)}
                  >
                    {configs[exchange.name] ? 'Update Configuration' : 'Configure'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedExchange?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="API Key"
              value={newConfig.api_key}
              onChange={handleConfigChange('api_key')}
              fullWidth
              margin="normal"
            />
            <TextField
              label="API Secret"
              value={newConfig.api_secret}
              onChange={handleConfigChange('api_secret')}
              fullWidth
              margin="normal"
              type="password"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newConfig.testnet}
                  onChange={handleConfigChange('testnet')}
                />
              }
              label="Use Testnet"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfigSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 