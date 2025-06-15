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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  PlayArrow as PlayArrowIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { styled } from '@mui/material/styles';
import ApiKeyTester from '../components/api-keys/ApiKeyTester';
import ApiKeyImportExport from '../components/api-keys/ApiKeyImportExport';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

interface ApiKey {
  id: string;
  name: string;
  exchange: string;
  apiKey: string;
  secretKey: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastUsed: string;
  createdAt: string;
}

// Тестовые данные для API ключей
const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Binance Main',
    exchange: 'Binance',
    apiKey: '************************',
    secretKey: '************************',
    permissions: ['spot', 'futures'],
    status: 'active',
    lastUsed: '2024-03-15 14:30',
    createdAt: '2024-03-01',
  },
  {
    id: '2',
    name: 'Bybit Trading',
    exchange: 'Bybit',
    apiKey: '************************',
    secretKey: '************************',
    permissions: ['spot'],
    status: 'active',
    lastUsed: '2024-03-14 09:15',
    createdAt: '2024-03-05',
  },
  {
    id: '3',
    name: 'OKX Test',
    exchange: 'OKX',
    apiKey: '************************',
    secretKey: '************************',
    permissions: ['spot', 'futures', 'margin'],
    status: 'inactive',
    lastUsed: '2024-03-10 18:45',
    createdAt: '2024-03-10',
  },
];

const ApiKeysPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showSecret, setShowSecret] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    name: '',
    exchange: '',
    apiKey: '',
    secretKey: '',
    permissions: [] as string[],
  });
  const [testingKey, setTestingKey] = useState<ApiKey | null>(null);
  const [importExportOpen, setImportExportOpen] = useState(false);

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

  const handleOpenDialog = (key?: ApiKey) => {
    if (key) {
      setSelectedKey(key);
      setFormData({
        name: key.name,
        exchange: key.exchange,
        apiKey: key.apiKey,
        secretKey: key.secretKey,
        permissions: key.permissions,
      });
    } else {
      setSelectedKey(null);
      setFormData({
        name: '',
        exchange: '',
        apiKey: '',
        secretKey: '',
        permissions: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedKey(null);
    setFormData({
      name: '',
      exchange: '',
      apiKey: '',
      secretKey: '',
      permissions: [],
    });
  };

  const handleSubmit = () => {
    // Здесь будет логика сохранения API ключа
    console.log('Saving API key:', formData);
    handleCloseDialog();
    showNotification('API ключ успешно сохранен', 'success');
  };

  const handleDelete = (id: string) => {
    // Здесь будет логика удаления API ключа
    console.log('Deleting API key:', id);
    showNotification('API ключ успешно удален', 'success');
  };

  const handleToggleSecret = (id: string) => {
    setShowSecret((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Скопировано в буфер обмена', 'success');
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

  const handleTestKey = (key: ApiKey) => {
    setTestingKey(key);
  };

  const handleCloseTesting = () => {
    setTestingKey(null);
  };

  const handleImportExportOpen = () => {
    setImportExportOpen(true);
  };

  const handleImportExportClose = () => {
    setImportExportOpen(false);
  };

  const handleImport = (keys: ApiKey[]) => {
    // Здесь будет логика импорта ключей
    console.log('Importing keys:', keys);
    showNotification('API ключи успешно импортированы', 'success');
  };

  const handleExport = (keys: ApiKey[]) => {
    // Здесь будет логика экспорта ключей
    console.log('Exporting keys:', keys);
    showNotification('API ключи успешно экспортированы', 'success');
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Управление API ключами</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleImportExportOpen}
              sx={{ mr: 2 }}
            >
              Импорт/Экспорт
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить API ключ
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Статистика */}
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Всего ключей
              </Typography>
              <Typography variant="h4">{mockApiKeys.length}</Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Активные ключи
              </Typography>
              <Typography variant="h4">
                {mockApiKeys.filter((key) => key.status === 'active').length}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Биржи
              </Typography>
              <Typography variant="h4">
                {new Set(mockApiKeys.map((key) => key.exchange)).size}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Последнее использование
              </Typography>
              <Typography variant="h4">
                {mockApiKeys[0]?.lastUsed.split(' ')[0] || 'Нет данных'}
              </Typography>
            </Item>
          </Grid>

          {/* Таблица API ключей */}
          <Grid item xs={12}>
            <Item>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Биржа</TableCell>
                      <TableCell>API Key</TableCell>
                      <TableCell>Secret Key</TableCell>
                      <TableCell>Разрешения</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Последнее использование</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockApiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.name}</TableCell>
                        <TableCell>{key.exchange}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {key.apiKey}
                            <Tooltip title="Скопировать">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(key.apiKey)}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {showSecret[key.id] ? key.secretKey : '************************'}
                            <Tooltip title={showSecret[key.id] ? 'Скрыть' : 'Показать'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleSecret(key.id)}
                              >
                                {showSecret[key.id] ? (
                                  <HideIcon fontSize="small" />
                                ) : (
                                  <ViewIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Скопировать">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(key.secretKey)}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {key.permissions.map((permission) => (
                            <Chip
                              key={permission}
                              label={permission}
                              size="small"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={key.status === 'active' ? 'Активен' : 'Неактивен'}
                            color={key.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{key.lastUsed}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleTestKey(key)}
                            sx={{ mr: 1 }}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(key)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(key.id)}
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

        {/* Диалог добавления/редактирования API ключа */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedKey ? 'Редактировать API ключ' : 'Новый API ключ'}
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
                label="API Key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Secret Key"
                type="password"
                value={formData.secretKey}
                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Разрешения</InputLabel>
                <Select
                  multiple
                  value={formData.permissions}
                  label="Разрешения"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permissions: e.target.value as string[],
                    })
                  }
                >
                  <MenuItem value="spot">Spot</MenuItem>
                  <MenuItem value="futures">Futures</MenuItem>
                  <MenuItem value="margin">Margin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedKey ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалог тестирования API ключа */}
        {testingKey && (
          <ApiKeyTester
            open={!!testingKey}
            onClose={handleCloseTesting}
            apiKey={testingKey.apiKey}
            secretKey={testingKey.secretKey}
            exchange={testingKey.exchange}
          />
        )}

        {/* Диалог импорта/экспорта */}
        <ApiKeyImportExport
          open={importExportOpen}
          onClose={handleImportExportClose}
          apiKeys={mockApiKeys}
          onImport={handleImport}
          onExport={handleExport}
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

export default ApiKeysPage; 