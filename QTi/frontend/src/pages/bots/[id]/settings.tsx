import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  MenuItem,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`bot-settings-tabpanel-${index}`}
    aria-labelledby={`bot-settings-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </Box>
);

interface BotSettings {
  // Общие настройки
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  enabled: boolean;

  // Настройки торговли
  leverage: number;
  positionSize: number;
  maxPositions: number;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  trailingStop: boolean;
  trailingStopDistance: number;

  // Настройки управления рисками
  maxDrawdown: number;
  dailyLossLimit: number;
  maxOpenPositions: number;
  riskPerTrade: number;
  useStopLoss: boolean;
  useTakeProfit: boolean;

  // Настройки стратегии
  timeframe: string;
  indicators: {
    rsi: {
      enabled: boolean;
      period: number;
      overbought: number;
      oversold: number;
    };
    macd: {
      enabled: boolean;
      fastPeriod: number;
      slowPeriod: number;
      signalPeriod: number;
    };
    bollinger: {
      enabled: boolean;
      period: number;
      stdDev: number;
    };
  };
}

const BotSettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (id) {
      fetchSettings();
    }
  }, [user, id, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для получения настроек бота
      const mockSettings: BotSettings = {
        name: 'BTC/USDT Bot',
        exchange: 'Binance',
        symbol: 'BTC/USDT',
        strategy: 'RSI + MACD',
        enabled: true,
        leverage: 3,
        positionSize: 100,
        maxPositions: 5,
        entryPrice: 0,
        takeProfit: 2,
        stopLoss: 1,
        trailingStop: true,
        trailingStopDistance: 0.5,
        maxDrawdown: 5,
        dailyLossLimit: 2,
        maxOpenPositions: 3,
        riskPerTrade: 1,
        useStopLoss: true,
        useTakeProfit: true,
        timeframe: '1h',
        indicators: {
          rsi: {
            enabled: true,
            period: 14,
            overbought: 70,
            oversold: 30
          },
          macd: {
            enabled: true,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9
          },
          bollinger: {
            enabled: false,
            period: 20,
            stdDev: 2
          }
        }
      };
      setSettings(mockSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      // Здесь будет API-запрос для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleIndicatorChange = (indicator: string, field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      indicators: {
        ...settings.indicators,
        [indicator]: {
          ...settings.indicators[indicator as keyof typeof settings.indicators],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Bot not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Bot Settings: {settings.name}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          aria-label="bot settings tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" />
          <Tab label="Trading" />
          <Tab label="Risk Management" />
          <Tab label="Strategy" />
        </Tabs>

        {/* Общие настройки */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bot Name"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Exchange"
                value={settings.exchange}
                onChange={(e) => handleChange('exchange', e.target.value)}
              >
                <MenuItem value="Binance">Binance</MenuItem>
                <MenuItem value="Bybit">Bybit</MenuItem>
                <MenuItem value="OKX">OKX</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Trading Pair"
                value={settings.symbol}
                onChange={(e) => handleChange('symbol', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Strategy"
                value={settings.strategy}
                onChange={(e) => handleChange('strategy', e.target.value)}
              >
                <MenuItem value="RSI + MACD">RSI + MACD</MenuItem>
                <MenuItem value="Bollinger Bands">Bollinger Bands</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                  />
                }
                label="Enable Bot"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Настройки торговли */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Leverage"
                value={settings.leverage}
                onChange={(e) => handleChange('leverage', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">x</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Position Size"
                value={settings.positionSize}
                onChange={(e) => handleChange('positionSize', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">USDT</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Take Profit"
                value={settings.takeProfit}
                onChange={(e) => handleChange('takeProfit', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Stop Loss"
                value={settings.stopLoss}
                onChange={(e) => handleChange('stopLoss', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.trailingStop}
                    onChange={(e) => handleChange('trailingStop', e.target.checked)}
                  />
                }
                label="Use Trailing Stop"
              />
            </Grid>
            {settings.trailingStop && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Trailing Stop Distance"
                  value={settings.trailingStopDistance}
                  onChange={(e) => handleChange('trailingStopDistance', Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Управление рисками */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Drawdown"
                value={settings.maxDrawdown}
                onChange={(e) => handleChange('maxDrawdown', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Daily Loss Limit"
                value={settings.dailyLossLimit}
                onChange={(e) => handleChange('dailyLossLimit', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Open Positions"
                value={settings.maxOpenPositions}
                onChange={(e) => handleChange('maxOpenPositions', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Risk Per Trade"
                value={settings.riskPerTrade}
                onChange={(e) => handleChange('riskPerTrade', Number(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.useStopLoss}
                    onChange={(e) => handleChange('useStopLoss', e.target.checked)}
                  />
                }
                label="Use Stop Loss"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.useTakeProfit}
                    onChange={(e) => handleChange('useTakeProfit', e.target.checked)}
                  />
                }
                label="Use Take Profit"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Настройки стратегии */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Timeframe"
                value={settings.timeframe}
                onChange={(e) => handleChange('timeframe', e.target.value)}
              >
                <MenuItem value="1m">1 minute</MenuItem>
                <MenuItem value="5m">5 minutes</MenuItem>
                <MenuItem value="15m">15 minutes</MenuItem>
                <MenuItem value="1h">1 hour</MenuItem>
                <MenuItem value="4h">4 hours</MenuItem>
                <MenuItem value="1d">1 day</MenuItem>
              </TextField>
            </Grid>

            {/* RSI Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                RSI Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.indicators.rsi.enabled}
                    onChange={(e) => handleIndicatorChange('rsi', 'enabled', e.target.checked)}
                  />
                }
                label="Enable RSI"
              />
            </Grid>
            {settings.indicators.rsi.enabled && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="RSI Period"
                    value={settings.indicators.rsi.period}
                    onChange={(e) => handleIndicatorChange('rsi', 'period', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Overbought Level"
                    value={settings.indicators.rsi.overbought}
                    onChange={(e) => handleIndicatorChange('rsi', 'overbought', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Oversold Level"
                    value={settings.indicators.rsi.oversold}
                    onChange={(e) => handleIndicatorChange('rsi', 'oversold', Number(e.target.value))}
                  />
                </Grid>
              </>
            )}

            {/* MACD Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                MACD Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.indicators.macd.enabled}
                    onChange={(e) => handleIndicatorChange('macd', 'enabled', e.target.checked)}
                  />
                }
                label="Enable MACD"
              />
            </Grid>
            {settings.indicators.macd.enabled && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fast Period"
                    value={settings.indicators.macd.fastPeriod}
                    onChange={(e) => handleIndicatorChange('macd', 'fastPeriod', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Slow Period"
                    value={settings.indicators.macd.slowPeriod}
                    onChange={(e) => handleIndicatorChange('macd', 'slowPeriod', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Signal Period"
                    value={settings.indicators.macd.signalPeriod}
                    onChange={(e) => handleIndicatorChange('macd', 'signalPeriod', Number(e.target.value))}
                  />
                </Grid>
              </>
            )}

            {/* Bollinger Bands Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bollinger Bands Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.indicators.bollinger.enabled}
                    onChange={(e) => handleIndicatorChange('bollinger', 'enabled', e.target.checked)}
                  />
                }
                label="Enable Bollinger Bands"
              />
            </Grid>
            {settings.indicators.bollinger.enabled && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Period"
                    value={settings.indicators.bollinger.period}
                    onChange={(e) => handleIndicatorChange('bollinger', 'period', Number(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Standard Deviation"
                    value={settings.indicators.bollinger.stdDev}
                    onChange={(e) => handleIndicatorChange('bollinger', 'stdDev', Number(e.target.value))}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ mr: 2 }}
        >
          Save Settings
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={saving}
        >
          Reset
        </Button>
      </Box>
    </Container>
  );
};

export default BotSettingsPage; 