import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  LinearProgress,
  Tooltip,
  SelectChangeEvent,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import MainLayout from '../components/layout/MainLayout';
import { styled } from '@mui/material/styles';
import BotManager from '../components/bots/BotManager';
import BotHistory from '../components/bots/BotHistory';
import BotSettings from '../components/bots/BotSettings';
import BotMonitor from '../components/bots/BotMonitor';
import BotConfigEditor from '../components/bots/BotConfigEditor';
import CandlestickChart from '../components/charts/CandlestickChart';

interface BotConfig {
  timeframe: string;
  leverage: number;
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
}

interface Bot {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  status: 'running' | 'stopped' | 'error';
  pnl: number;
  winRate: number;
  openPositions: number;
  totalTrades: number;
  lastUpdate: string;
  strategy: string;
  profit: number;
  uptime: string;
  config: BotConfig;
}

interface FormData {
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  leverage: number;
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bot-tabpanel-${index}`}
      aria-labelledby={`bot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `bot-tab-${index}`,
    'aria-controls': `bot-tabpanel-${index}`,
  };
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor:
    status === 'running'
      ? theme.palette.success.main
      : status === 'stopped'
      ? theme.palette.warning.main
      : theme.palette.error.main,
  color: theme.palette.common.white,
}));

const BotsPage: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<FormData>({
    name: '',
    exchange: '',
    symbol: '',
    strategy: '',
    timeframe: '',
    leverage: 1,
    positionSize: 0.1,
    stopLoss: 2,
    takeProfit: 4,
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [tabValue, setTabValue] = useState(0);

  const exchanges = ['Binance', 'Bybit', 'OKX'];
  const strategies = ['RSI Strategy', 'MACD Strategy', 'Bollinger Bands Strategy'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBots();
  }, [user, router]);

  const fetchBots = async () => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для получения списка ботов
      const mockBots: Bot[] = [
        {
          id: '1',
          name: 'BTC/USDT Bot',
          exchange: 'Binance',
          symbol: 'BTC/USDT',
          status: 'running',
          pnl: 2.5,
          winRate: 65,
          openPositions: 2,
          totalTrades: 150,
          lastUpdate: new Date().toISOString(),
          strategy: 'Grid Trading',
          profit: 2.5,
          uptime: '3d 5h',
          config: {
            timeframe: '1h',
            leverage: 1,
            positionSize: 0.1,
            stopLoss: 2,
            takeProfit: 4,
          },
        },
        {
          id: '2',
          name: 'ETH/USDT Bot',
          exchange: 'Bybit',
          symbol: 'ETH/USDT',
          status: 'stopped',
          pnl: -1.2,
          winRate: 45,
          openPositions: 0,
          totalTrades: 80,
          lastUpdate: new Date().toISOString(),
          strategy: 'DCA',
          profit: -1.2,
          uptime: '0d 0h',
          config: {
            timeframe: '4h',
            leverage: 2,
            positionSize: 0.2,
            stopLoss: 3,
            takeProfit: 6,
          },
        },
        {
          id: '3',
          name: 'SOL/USDT Bot',
          exchange: 'Bybit',
          symbol: 'SOL/USDT',
          status: 'running',
          pnl: 3.8,
          winRate: 70,
          openPositions: 3,
          totalTrades: 234,
          lastUpdate: new Date().toISOString(),
          strategy: 'Grid Trading',
          profit: 3.8,
          uptime: '5d 12h',
          config: {
            timeframe: '1h',
            leverage: 1,
            positionSize: 0.1,
            stopLoss: 2,
            takeProfit: 4,
          },
        }
      ];
      setBots(mockBots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bots');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBot = async (botId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для запуска бота
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: 'running' } : bot
      ));
      setSuccess('Bot started successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot');
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для остановки бота
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: 'stopped' } : bot
      ));
      setSuccess('Bot stopped successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop bot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для удаления бота
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setBots(bots.filter(bot => bot.id !== botId));
      setSuccess('Bot deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bot');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (bot?: Bot) => {
    if (bot) {
      setSelectedBot(bot);
      setFormData({
        name: bot.name,
        exchange: bot.exchange,
        symbol: bot.symbol,
        strategy: bot.strategy,
        timeframe: bot.config.timeframe,
        leverage: bot.config.leverage,
        positionSize: bot.config.positionSize,
        stopLoss: bot.config.stopLoss,
        takeProfit: bot.config.takeProfit,
      });
    } else {
      setSelectedBot(null);
      setFormData({
        name: '',
        exchange: '',
        symbol: '',
        strategy: '',
        timeframe: '',
        leverage: 1,
        positionSize: 0.1,
        stopLoss: 2,
        takeProfit: 4,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBot(null);
    setFormData({
      name: '',
      exchange: '',
      symbol: '',
      strategy: '',
      timeframe: '',
      leverage: 1,
      positionSize: 0.1,
      stopLoss: 2,
      takeProfit: 4,
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      // Здесь будет API-запрос для сохранения бота
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      if (selectedBot) {
        setBots((prev) =>
          prev.map((bot) =>
            bot.id === selectedBot.id
              ? {
                  ...bot,
                  name: formData.name,
                  exchange: formData.exchange,
                  symbol: formData.symbol,
                  strategy: formData.strategy,
                  config: {
                    timeframe: formData.timeframe,
                    leverage: formData.leverage,
                    positionSize: formData.positionSize,
                    stopLoss: formData.stopLoss,
                    takeProfit: formData.takeProfit,
                  },
                }
              : bot
          )
        );
      } else {
        const newBot: Bot = {
          id: String(bots.length + 1),
          name: formData.name,
          exchange: formData.exchange,
          symbol: formData.symbol,
          status: 'stopped',
          pnl: 0,
          winRate: 0,
          openPositions: 0,
          totalTrades: 0,
          lastUpdate: new Date().toISOString(),
          strategy: formData.strategy,
          profit: 0,
          uptime: '0d 0h',
          config: {
            timeframe: formData.timeframe,
            leverage: formData.leverage,
            positionSize: formData.positionSize,
            stopLoss: formData.stopLoss,
            takeProfit: formData.takeProfit,
          },
        };
        setBots((prev) => [...prev, newBot]);
      }
      setSuccess(selectedBot ? 'Bot updated successfully' : 'Bot created successfully');
      handleCloseDialog();
      fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bot');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (bot: Bot) => {
    const newBot = {
      ...bot,
      id: Date.now().toString(),
      name: `${bot.name} (копия)`,
    };
    handleOpenDialog(newBot);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading && !bots.length) {
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

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Управление ботами</Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Добавить бота
          </Button>
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

        <Grid container spacing={3}>
          {/* Статистика */}
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Всего ботов
              </Typography>
              <Typography variant="h4">{bots.length}</Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Активные боты
              </Typography>
              <Typography variant="h4">
                {bots.filter((bot) => bot.status === 'running').length}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Средняя прибыль
              </Typography>
              <Typography variant="h4" color="success.main">
                {(
                  bots.reduce((sum, bot) => sum + bot.profit, 0) / bots.length
                ).toFixed(2)}%
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Всего сделок
              </Typography>
              <Typography variant="h4">
                {bots.reduce((sum, bot) => sum + bot.totalTrades, 0)}
              </Typography>
            </Item>
          </Grid>

          {/* Таблица ботов */}
          <Grid item xs={12}>
            <Item>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Биржа</TableCell>
                      <TableCell>Стратегия</TableCell>
                      <TableCell align="right">Прибыль</TableCell>
                      <TableCell align="right">Сделки</TableCell>
                      <TableCell align="right">Время работы</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bots.map((bot) => (
                      <TableRow key={bot.id}>
                        <TableCell>{bot.name}</TableCell>
                        <TableCell>
                          <StatusChip
                            label={
                              bot.status === 'running'
                                ? 'Работает'
                                : bot.status === 'stopped'
                                ? 'Остановлен'
                                : 'Ошибка'
                            }
                            status={bot.status}
                          />
                        </TableCell>
                        <TableCell>{bot.exchange}</TableCell>
                        <TableCell>{bot.strategy}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: bot.profit >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {bot.profit >= 0 ? '+' : ''}
                          {bot.profit.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">{bot.totalTrades}</TableCell>
                        <TableCell align="right">{bot.uptime}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Settings">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(bot)}
                              disabled={loading}
                            >
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteBot(bot.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Item>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBot ? 'Редактировать бота' : 'Новый бот'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Название"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Биржа</InputLabel>
                <Select
                  name="exchange"
                  value={formData.exchange}
                  label="Биржа"
                  onChange={handleSelectChange}
                >
                  {exchanges.map((exchange) => (
                    <MenuItem key={exchange} value={exchange}>
                      {exchange}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Торговая пара"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Стратегия</InputLabel>
                <Select
                  name="strategy"
                  value={formData.strategy}
                  label="Стратегия"
                  onChange={handleSelectChange}
                >
                  {strategies.map((strategy) => (
                    <MenuItem key={strategy} value={strategy}>
                      {strategy}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  name="timeframe"
                  value={formData.timeframe}
                  label="Timeframe"
                  onChange={handleSelectChange}
                >
                  {timeframes.map((tf) => (
                    <MenuItem key={tf} value={tf}>
                      {tf}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Leverage"
                name="leverage"
                type="number"
                value={formData.leverage}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position Size"
                name="positionSize"
                type="number"
                value={formData.positionSize}
                onChange={handleInputChange}
                inputProps={{ min: 0.01, max: 1, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stop Loss (%)"
                name="stopLoss"
                type="number"
                value={formData.stopLoss}
                onChange={handleInputChange}
                inputProps={{ min: 0.1, max: 100, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Take Profit (%)"
                name="takeProfit"
                type="number"
                value={formData.takeProfit}
                onChange={handleInputChange}
                inputProps={{ min: 0.1, max: 100, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="bot tabs">
            <Tab label="Bots" {...a11yProps(0)} />
            <Tab label="History" {...a11yProps(1)} />
            <Tab label="Settings" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <BotManager
            bots={bots}
            configs={[]}
            onAddBot={() => {}}
            onDeleteBot={() => {}}
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
            onRefreshBot={() => {}}
            onViewHistory={() => {}}
            onViewSettings={() => {}}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {selectedBot ? (
            <BotHistory
              botId={selectedBot.id}
              trades={[]}
              onRefresh={() => {}}
              onExport={() => {}}
              onFilter={(filters) => {}}
            />
          ) : (
            <Typography>Select a bot to view its history</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {selectedBot ? (
            <BotSettings
              settings={{
                id: selectedBot.id,
                name: selectedBot.name,
                exchange: selectedBot.exchange,
                symbol: selectedBot.symbol,
                strategy: selectedBot.strategy,
                riskManagement: {
                  maxDrawdown: 20,
                  stopLoss: selectedBot.config.stopLoss,
                  takeProfit: selectedBot.config.takeProfit,
                  positionSize: selectedBot.config.positionSize,
                },
                tradingSchedule: {
                  enabled: false,
                  startTime: '09:00',
                  endTime: '17:00',
                  timezone: 'UTC',
                },
                notifications: {
                  email: true,
                  telegram: false,
                  webhook: false,
                },
                advancedSettings: {},
              }}
              onSave={() => {}}
              onReset={() => {}}
            />
          ) : (
            <Typography>Select a bot to view its settings</Typography>
          )}
        </TabPanel>
      </Box>
    </MainLayout>
  );
};

export default BotsPage; 