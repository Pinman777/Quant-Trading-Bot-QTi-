import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import { useState } from 'react';

interface BotConfig {
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  config: {
    gridSize: number;
    gridSpacing: number;
    maxPositions: number;
    stopLoss: number;
    takeProfit: number;
  };
}

interface BotConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: BotConfig) => void;
  initialConfig?: Partial<BotConfig>;
}

const exchanges = ['Binance', 'Bybit', 'OKX'];
const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'];
const strategies = ['Grid', 'DCA', 'RSI', 'MACD'];

export default function BotConfigDialog({
  open,
  onClose,
  onSave,
  initialConfig,
}: BotConfigDialogProps) {
  const [config, setConfig] = useState<BotConfig>({
    name: initialConfig?.name || '',
    exchange: initialConfig?.exchange || '',
    symbol: initialConfig?.symbol || '',
    strategy: initialConfig?.strategy || '',
    config: {
      gridSize: initialConfig?.config?.gridSize || 10,
      gridSpacing: initialConfig?.config?.gridSpacing || 1,
      maxPositions: initialConfig?.config?.maxPositions || 3,
      stopLoss: initialConfig?.config?.stopLoss || 5,
      takeProfit: initialConfig?.config?.takeProfit || 10,
    },
  });

  const handleChange = (field: keyof BotConfig) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleConfigChange = (field: keyof BotConfig['config']) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: Number(event.target.value),
      },
    }));
  };

  const handleSubmit = () => {
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialConfig ? 'Edit Bot Configuration' : 'New Bot Configuration'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bot Name"
              value={config.name}
              onChange={handleChange('name')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Exchange</InputLabel>
              <Select
                value={config.exchange}
                label="Exchange"
                onChange={handleChange('exchange')}
              >
                {exchanges.map((exchange) => (
                  <MenuItem key={exchange} value={exchange}>
                    {exchange}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Symbol</InputLabel>
              <Select
                value={config.symbol}
                label="Symbol"
                onChange={handleChange('symbol')}
              >
                {symbols.map((symbol) => (
                  <MenuItem key={symbol} value={symbol}>
                    {symbol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={config.strategy}
                label="Strategy"
                onChange={handleChange('strategy')}
              >
                {strategies.map((strategy) => (
                  <MenuItem key={strategy} value={strategy}>
                    {strategy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Strategy Configuration
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Grid Size"
              value={config.config.gridSize}
              onChange={handleConfigChange('gridSize')}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Grid Spacing (%)"
              value={config.config.gridSpacing}
              onChange={handleConfigChange('gridSpacing')}
              InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Max Positions"
              value={config.config.maxPositions}
              onChange={handleConfigChange('maxPositions')}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Stop Loss (%)"
              value={config.config.stopLoss}
              onChange={handleConfigChange('stopLoss')}
              InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Take Profit (%)"
              value={config.config.takeProfit}
              onChange={handleConfigChange('takeProfit')}
              InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialConfig ? 'Save Changes' : 'Create Bot'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 