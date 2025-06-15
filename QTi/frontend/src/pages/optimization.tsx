import { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import Layout from '../components/Layout';
import OptimizationConfig from '../components/OptimizationConfig';
import OptimizationResults from '../components/OptimizationResults';
import { useAuth } from '../context/AuthContext';
import { optimizationApi } from '../services/api';

interface OptimizationResult {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  averageProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: {
    time: string;
    value: number;
  }[];
  trades: {
    time: string;
    type: 'buy' | 'sell';
    price: number;
    size: number;
    profit: number;
  }[];
  parameters: {
    gridSize: number;
    gridSpacing: number;
    maxPositions: number;
    stopLoss: number;
    takeProfit: number;
  };
}

export default function OptimizationPage() {
  const { user } = useAuth();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [timeframes, setTimeframes] = useState<string[]>([]);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<OptimizationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchSymbols();
    fetchTimeframes();
    fetchResults();
  }, []);

  const fetchSymbols = async () => {
    try {
      const response = await optimizationApi.getSymbols();
      setSymbols(response.data);
    } catch (error) {
      showNotification('Ошибка при загрузке списка пар', 'error');
    }
  };

  const fetchTimeframes = async () => {
    try {
      const response = await optimizationApi.getTimeframes();
      setTimeframes(response.data);
    } catch (error) {
      showNotification('Ошибка при загрузке таймфреймов', 'error');
    }
  };

  const fetchResults = async () => {
    try {
      const response = await optimizationApi.getResults();
      setResults(response.data);
    } catch (error) {
      showNotification('Ошибка при загрузке результатов', 'error');
    }
  };

  const handleStart = async (config: any) => {
    setIsRunning(true);
    try {
      const response = await optimizationApi.startOptimization(config);
      showNotification('Оптимизация запущена', 'success');
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const status = await optimizationApi.getStatus(response.data.id);
          if (status.data.status === 'completed') {
            clearInterval(pollInterval);
            setIsRunning(false);
            fetchResults();
            showNotification('Оптимизация завершена', 'success');
          } else if (status.data.status === 'failed') {
            clearInterval(pollInterval);
            setIsRunning(false);
            showNotification('Ошибка при оптимизации', 'error');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsRunning(false);
          showNotification('Ошибка при проверке статуса', 'error');
        }
      }, 5000);
    } catch (error) {
      setIsRunning(false);
      showNotification('Ошибка при запуске оптимизации', 'error');
    }
  };

  const handleResultSelect = (result: OptimizationResult) => {
    setSelectedResult(result);
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Оптимизация стратегий
        </Typography>

        <Box mb={4}>
          <OptimizationConfig
            symbols={symbols}
            timeframes={timeframes}
            onStart={handleStart}
            isRunning={isRunning}
          />
        </Box>

        <Box>
          <OptimizationResults
            results={results}
            selectedResult={selectedResult}
            onResultSelect={handleResultSelect}
          />
        </Box>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleNotificationClose}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
} 