import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ApiKeyTesterProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  secretKey: string;
  exchange: string;
}

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const ApiKeyTester: React.FC<ApiKeyTesterProps> = ({
  open,
  onClose,
  apiKey,
  secretKey,
  exchange,
}) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    // Имитация тестирования API ключа
    const testResults: TestResult[] = [
      {
        name: 'Проверка формата ключей',
        status: 'success',
        message: 'Формат ключей корректный',
      },
      {
        name: 'Проверка подключения к API',
        status: 'success',
        message: 'Успешное подключение к API',
      },
      {
        name: 'Проверка прав доступа',
        status: 'warning',
        message: 'Ограниченный доступ к API',
      },
      {
        name: 'Проверка торговых операций',
        status: 'error',
        message: 'Нет прав на торговые операции',
      },
    ];

    // Имитация задержки тестирования
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Тестирование API ключа</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Биржа: {exchange}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            API Key: {apiKey}
          </Typography>
        </Box>

        {results.length > 0 ? (
          <List>
            {results.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>{getStatusIcon(result.status)}</ListItemIcon>
                  <ListItemText
                    primary={result.name}
                    secondary={result.message}
                    secondaryTypographyProps={{
                      color: result.status === 'error' ? 'error' : 'text.secondary',
                    }}
                  />
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Нажмите "Начать тестирование" для проверки API ключа
          </Alert>
        )}

        {testing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        <Button
          onClick={runTests}
          variant="contained"
          color="primary"
          disabled={testing}
        >
          {testing ? 'Тестирование...' : 'Начать тестирование'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyTester; 