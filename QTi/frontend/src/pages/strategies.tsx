import React, { useState } from 'react';
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
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { styled } from '@mui/material/styles';
import StrategyParameters from '../components/strategies/StrategyParameters';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

interface Strategy {
  id: string;
  name: string;
  type: 'grid' | 'dca' | 'rsi' | 'custom';
  description: string;
  parameters: {
    [key: string]: any;
  };
  status: 'active' | 'inactive';
  lastModified: string;
  createdBy: string;
  performance?: {
    profit: number;
    trades: number;
    winRate: number;
  };
}

// Тестовые данные для стратегий
const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Grid Trading BTC/USDT',
    type: 'grid',
    description: 'Стратегия сетки для торговли BTC/USDT с фиксированным шагом',
    parameters: {
      gridSize: 10,
      gridStep: 100,
      totalInvestment: 1000,
      takeProfit: 2,
      stopLoss: 1,
    },
    status: 'active',
    lastModified: '2024-03-15 14:30',
    createdBy: 'admin',
    performance: {
      profit: 5.2,
      trades: 45,
      winRate: 68,
    },
  },
  {
    id: '2',
    name: 'DCA ETH/USDT',
    type: 'dca',
    description: 'Стратегия усреднения для ETH/USDT',
    parameters: {
      baseOrder: 0.1,
      stepSize: 0.05,
      maxOrders: 5,
      priceDeviation: 2,
    },
    status: 'active',
    lastModified: '2024-03-14 09:15',
    createdBy: 'admin',
    performance: {
      profit: 3.8,
      trades: 28,
      winRate: 75,
    },
  },
  {
    id: '3',
    name: 'RSI Strategy',
    type: 'rsi',
    description: 'Стратегия на основе индикатора RSI',
    parameters: {
      period: 14,
      overbought: 70,
      oversold: 30,
      stopLoss: 2,
      takeProfit: 4,
    },
    status: 'inactive',
    lastModified: '2024-03-10 18:45',
    createdBy: 'admin',
    performance: {
      profit: -1.5,
      trades: 32,
      winRate: 45,
    },
  },
];

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
      id={`strategy-tabpanel-${index}`}
      aria-labelledby={`strategy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StrategiesPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    parameters: {} as { [key: string]: any },
  });

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (strategy?: Strategy) => {
    if (strategy) {
      setSelectedStrategy(strategy);
      setFormData({
        name: strategy.name,
        type: strategy.type,
        description: strategy.description,
        parameters: strategy.parameters,
      });
    } else {
      setSelectedStrategy(null);
      setFormData({
        name: '',
        type: '',
        description: '',
        parameters: {},
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStrategy(null);
    setFormData({
      name: '',
      type: '',
      description: '',
      parameters: {},
    });
  };

  const handleSubmit = () => {
    // Здесь будет логика сохранения стратегии
    console.log('Saving strategy:', formData);
    handleCloseDialog();
    showNotification('Стратегия успешно сохранена', 'success');
  };

  const handleDelete = (id: string) => {
    // Здесь будет логика удаления стратегии
    console.log('Deleting strategy:', id);
    showNotification('Стратегия успешно удалена', 'success');
  };

  const handleCopyStrategy = (strategy: Strategy) => {
    // Здесь будет логика копирования стратегии
    console.log('Copying strategy:', strategy);
    showNotification('Стратегия успешно скопирована', 'success');
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

  const handleParametersChange = (parameters: { [key: string]: any }) => {
    setFormData({ ...formData, parameters });
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Управление стратегиями</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить стратегию
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Статистика */}
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Всего стратегий
              </Typography>
              <Typography variant="h4">{mockStrategies.length}</Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Активные стратегии
              </Typography>
              <Typography variant="h4">
                {mockStrategies.filter((s) => s.status === 'active').length}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Средняя прибыль
              </Typography>
              <Typography variant="h4">
                {(
                  mockStrategies.reduce(
                    (acc, s) => acc + (s.performance?.profit || 0),
                    0
                  ) / mockStrategies.length
                ).toFixed(1)}
                %
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Средний винрейт
              </Typography>
              <Typography variant="h4">
                {(
                  mockStrategies.reduce(
                    (acc, s) => acc + (s.performance?.winRate || 0),
                    0
                  ) / mockStrategies.length
                ).toFixed(1)}
                %
              </Typography>
            </Item>
          </Grid>

          {/* Таблица стратегий */}
          <Grid item xs={12}>
            <Item>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Все стратегии" />
                  <Tab label="Grid Trading" />
                  <Tab label="DCA" />
                  <Tab label="RSI" />
                  <Tab label="Пользовательские" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Название</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Параметры</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Производительность</TableCell>
                        <TableCell>Последнее изменение</TableCell>
                        <TableCell align="right">Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockStrategies.map((strategy) => (
                        <TableRow key={strategy.id}>
                          <TableCell>{strategy.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={strategy.type.toUpperCase()}
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{strategy.description}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={JSON.stringify(strategy.parameters, null, 2)}
                            >
                              <IconButton size="small">
                                <SettingsIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={strategy.status === 'active' ? 'Активна' : 'Неактивна'}
                              color={strategy.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {strategy.performance && (
                              <Box>
                                <Typography variant="body2">
                                  Прибыль: {strategy.performance.profit}%
                                </Typography>
                                <Typography variant="body2">
                                  Сделки: {strategy.performance.trades}
                                </Typography>
                                <Typography variant="body2">
                                  Винрейт: {strategy.performance.winRate}%
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>{strategy.lastModified}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleCopyStrategy(strategy)}
                              sx={{ mr: 1 }}
                            >
                              <CopyIcon />
                            </IconButton>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(strategy)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(strategy.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Item>
          </Grid>
        </Grid>

        {/* Диалог добавления/редактирования стратегии */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedStrategy ? 'Редактировать стратегию' : 'Новая стратегия'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Название"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Тип стратегии</InputLabel>
                  <Select
                    value={formData.type}
                    label="Тип стратегии"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="grid">Grid Trading</MenuItem>
                    <MenuItem value="dca">DCA</MenuItem>
                    <MenuItem value="rsi">RSI</MenuItem>
                    <MenuItem value="custom">Пользовательская</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Описание"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Grid>
              {formData.type && (
                <Grid item xs={12}>
                  <StrategyParameters
                    type={formData.type}
                    parameters={formData.parameters}
                    onChange={handleParametersChange}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedStrategy ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default StrategiesPage; 