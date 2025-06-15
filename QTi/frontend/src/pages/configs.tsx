import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { styled } from '@mui/material/styles';
import ConfigFilters from '../components/configs/ConfigFilters';
import ConfigImportExport from '../components/configs/ConfigImportExport';
import StrategyPreview from '../components/configs/StrategyPreview';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

interface Config {
  id: string;
  name: string;
  exchange: string;
  symbol: string;
  strategy: string;
  timeframe: string;
  lastModified: string;
  status: 'active' | 'inactive';
}

// Тестовые данные для конфигураций
const mockConfigs: Config[] = [
  {
    id: '1',
    name: 'BTC/USDT Grid',
    exchange: 'Binance',
    symbol: 'BTC/USDT',
    strategy: 'Grid',
    timeframe: '1h',
    lastModified: '2024-03-15 14:30',
    status: 'active',
  },
  {
    id: '2',
    name: 'ETH/USDT DCA',
    exchange: 'Bybit',
    symbol: 'ETH/USDT',
    strategy: 'DCA',
    timeframe: '4h',
    lastModified: '2024-03-14 09:15',
    status: 'inactive',
  },
  {
    id: '3',
    name: 'SOL/USDT Grid',
    exchange: 'OKX',
    symbol: 'SOL/USDT',
    strategy: 'Grid',
    timeframe: '15m',
    lastModified: '2024-03-13 18:45',
    status: 'active',
  },
];

// Тестовые параметры стратегий
const strategyParameters = {
  Grid: [
    {
      name: 'Grid Size',
      value: 10,
      description: 'Количество сеток для торговли',
    },
    {
      name: 'Grid Spacing',
      value: '1%',
      description: 'Расстояние между сетками в процентах',
    },
    {
      name: 'Total Investment',
      value: '1000 USDT',
      description: 'Общая сумма инвестиций',
    },
  ],
  DCA: [
    {
      name: 'Initial Investment',
      value: '500 USDT',
      description: 'Начальная сумма инвестиций',
    },
    {
      name: 'DCA Amount',
      value: '100 USDT',
      description: 'Сумма для усреднения',
    },
    {
      name: 'DCA Interval',
      value: '24h',
      description: 'Интервал между усреднениями',
    },
  ],
  RSI: [
    {
      name: 'RSI Period',
      value: 14,
      description: 'Период для расчета RSI',
    },
    {
      name: 'Overbought Level',
      value: 70,
      description: 'Уровень перекупленности',
    },
    {
      name: 'Oversold Level',
      value: 30,
      description: 'Уровень перепроданности',
    },
  ],
};

const ConfigsPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    exchange: '',
    symbol: '',
    strategy: '',
    timeframe: '',
  });

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Состояния для уведомлений
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Состояние для предпросмотра стратегии
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewStrategy, setPreviewStrategy] = useState('');

  // Фильтрация конфигураций
  const filteredConfigs = useMemo(() => {
    return mockConfigs.filter((config) => {
      const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesExchange = !exchangeFilter || config.exchange === exchangeFilter;
      const matchesStrategy = !strategyFilter || config.strategy === strategyFilter;
      const matchesStatus = !statusFilter || config.status === statusFilter;
      return matchesSearch && matchesExchange && matchesStrategy && matchesStatus;
    });
  }, [mockConfigs, searchQuery, exchangeFilter, strategyFilter, statusFilter]);

  const handleOpenDialog = (config?: Config) => {
    if (config) {
      setSelectedConfig(config);
      setFormData({
        name: config.name,
        exchange: config.exchange,
        symbol: config.symbol,
        strategy: config.strategy,
        timeframe: config.timeframe,
      });
    } else {
      setSelectedConfig(null);
      setFormData({
        name: '',
        exchange: '',
        symbol: '',
        strategy: '',
        timeframe: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedConfig(null);
    setFormData({
      name: '',
      exchange: '',
      symbol: '',
      strategy: '',
      timeframe: '',
    });
  };

  const handleSubmit = () => {
    // Здесь будет логика сохранения конфигурации
    console.log('Saving config:', formData);
    handleCloseDialog();
    showNotification('Конфигурация успешно сохранена', 'success');
  };

  const handleDelete = (id: string) => {
    // Здесь будет логика удаления конфигурации
    console.log('Deleting config:', id);
    showNotification('Конфигурация успешно удалена', 'success');
  };

  const handleCopy = (id: string) => {
    // Здесь будет логика копирования конфигурации
    console.log('Copying config:', id);
    showNotification('Конфигурация успешно скопирована', 'success');
  };

  const handlePreviewStrategy = (strategy: string) => {
    setPreviewStrategy(strategy);
    setPreviewOpen(true);
  };

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleExport = () => {
    // Здесь будет логика экспорта конфигураций
    console.log('Exporting configs');
    showNotification('Конфигурации успешно экспортированы', 'success');
  };

  const handleImport = (file: File) => {
    // Здесь будет логика импорта конфигураций
    console.log('Importing configs from file:', file.name);
    showNotification('Конфигурации успешно импортированы', 'success');
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Управление конфигурациями</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ConfigImportExport onExport={handleExport} onImport={handleImport} />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Новая конфигурация
            </Button>
          </Box>
        </Box>

        <ConfigFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          exchangeFilter={exchangeFilter}
          onExchangeChange={setExchangeFilter}
          strategyFilter={strategyFilter}
          onStrategyChange={setStrategyFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <Grid container spacing={3}>
          {/* Статистика */}
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Всего конфигураций
              </Typography>
              <Typography variant="h4">{filteredConfigs.length}</Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Активные конфигурации
              </Typography>
              <Typography variant="h4">
                {filteredConfigs.filter((config) => config.status === 'active').length}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Стратегии
              </Typography>
              <Typography variant="h4">
                {new Set(filteredConfigs.map((config) => config.strategy)).size}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Биржи
              </Typography>
              <Typography variant="h4">
                {new Set(filteredConfigs.map((config) => config.exchange)).size}
              </Typography>
            </Item>
          </Grid>

          {/* Таблица конфигураций */}
          <Grid item xs={12}>
            <Item>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Биржа</TableCell>
                      <TableCell>Пара</TableCell>
                      <TableCell>Стратегия</TableCell>
                      <TableCell>Таймфрейм</TableCell>
                      <TableCell>Последнее изменение</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>{config.name}</TableCell>
                        <TableCell>{config.exchange}</TableCell>
                        <TableCell>{config.symbol}</TableCell>
                        <TableCell>{config.strategy}</TableCell>
                        <TableCell>{config.timeframe}</TableCell>
                        <TableCell>{config.lastModified}</TableCell>
                        <TableCell>
                          <Chip
                            label={config.status === 'active' ? 'Активна' : 'Неактивна'}
                            color={config.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handlePreviewStrategy(config.strategy)}
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(config)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleCopy(config.id)}
                          >
                            <CopyIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(config.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Item>
          </Grid>
        </Grid>

        {/* Диалог добавления/редактирования конфигурации */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedConfig ? 'Редактировать конфигурацию' : 'Новая конфигурация'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Биржа</InputLabel>
                <Select
                  value={formData.exchange}
                  label="Биржа"
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                >
                  <MenuItem value="Binance">Binance</MenuItem>
                  <MenuItem value="Bybit">Bybit</MenuItem>
                  <MenuItem value="OKX">OKX</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Торговая пара"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Стратегия</InputLabel>
                <Select
                  value={formData.strategy}
                  label="Стратегия"
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                >
                  <MenuItem value="Grid">Grid</MenuItem>
                  <MenuItem value="DCA">DCA</MenuItem>
                  <MenuItem value="RSI">RSI</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Таймфрейм</InputLabel>
                <Select
                  value={formData.timeframe}
                  label="Таймфрейм"
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                >
                  <MenuItem value="1m">1 минута</MenuItem>
                  <MenuItem value="5m">5 минут</MenuItem>
                  <MenuItem value="15m">15 минут</MenuItem>
                  <MenuItem value="1h">1 час</MenuItem>
                  <MenuItem value="4h">4 часа</MenuItem>
                  <MenuItem value="1d">1 день</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedConfig ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Предпросмотр стратегии */}
        <StrategyPreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          strategy={previewStrategy}
          parameters={strategyParameters[previewStrategy as keyof typeof strategyParameters] || []}
        />

        {/* Уведомления */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default ConfigsPage; 