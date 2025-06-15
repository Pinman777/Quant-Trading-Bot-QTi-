import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MainLayout from '../components/layout/MainLayout';
import PerformanceChart from '../components/charts/PerformanceChart';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

// Тестовые данные для графика
const mockChartData = [
  { time: '2024-01-01', value: 100 },
  { time: '2024-01-02', value: 102 },
  { time: '2024-01-03', value: 101 },
  { time: '2024-01-04', value: 103 },
  { time: '2024-01-05', value: 105 },
  { time: '2024-01-06', value: 104 },
  { time: '2024-01-07', value: 106 },
];

// Тестовые данные для результатов бэктестинга
const mockResults = [
  {
    id: 1,
    strategy: 'Grid Trading',
    symbol: 'BTC/USDT',
    timeframe: '1h',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    profit: 2.5,
    trades: 156,
    winRate: 65,
    profitFactor: 1.8,
    maxDrawdown: 5.2,
  },
  {
    id: 2,
    strategy: 'DCA',
    symbol: 'ETH/USDT',
    timeframe: '4h',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    profit: -1.2,
    trades: 89,
    winRate: 45,
    profitFactor: 0.9,
    maxDrawdown: 8.5,
  },
];

const BacktestingPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const strategies = ['Grid Trading', 'DCA', 'RSI', 'MACD'];
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  const handleRunBacktest = () => {
    // Здесь будет логика запуска бэктестинга
    console.log('Running backtest with:', {
      strategy: selectedStrategy,
      symbol: selectedSymbol,
      timeframe: selectedTimeframe,
      startDate,
      endDate,
    });
  };

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>
          Бэктестинг
        </Typography>

        <Grid container spacing={3}>
          {/* Параметры бэктестинга */}
          <Grid item xs={12}>
            <Item>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Стратегия</InputLabel>
                    <Select
                      value={selectedStrategy}
                      label="Стратегия"
                      onChange={(e) => setSelectedStrategy(e.target.value)}
                    >
                      {strategies.map((strategy) => (
                        <MenuItem key={strategy} value={strategy}>
                          {strategy}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Пара</InputLabel>
                    <Select
                      value={selectedSymbol}
                      label="Пара"
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                    >
                      {symbols.map((symbol) => (
                        <MenuItem key={symbol} value={symbol}>
                          {symbol}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Таймфрейм</InputLabel>
                    <Select
                      value={selectedTimeframe}
                      label="Таймфрейм"
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                    >
                      {timeframes.map((timeframe) => (
                        <MenuItem key={timeframe} value={timeframe}>
                          {timeframe}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRunBacktest}
                    sx={{ height: '56px' }}
                  >
                    Запустить бэктест
                  </Button>
                </Grid>
              </Grid>
            </Item>
          </Grid>

          {/* График */}
          <Grid item xs={12}>
            <Item>
              <Typography variant="h6" gutterBottom>
                График результатов
              </Typography>
              <PerformanceChart data={mockChartData} height={400} />
            </Item>
          </Grid>

          {/* Результаты бэктестинга */}
          <Grid item xs={12}>
            <Item>
              <Typography variant="h6" gutterBottom>
                Результаты бэктестинга
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Стратегия</TableCell>
                      <TableCell>Пара</TableCell>
                      <TableCell>Таймфрейм</TableCell>
                      <TableCell>Период</TableCell>
                      <TableCell align="right">Прибыль</TableCell>
                      <TableCell align="right">Сделки</TableCell>
                      <TableCell align="right">Винрейт</TableCell>
                      <TableCell align="right">Профит-фактор</TableCell>
                      <TableCell align="right">Макс. просадка</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.strategy}</TableCell>
                        <TableCell>{result.symbol}</TableCell>
                        <TableCell>{result.timeframe}</TableCell>
                        <TableCell>
                          {result.startDate} - {result.endDate}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: result.profit >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {result.profit >= 0 ? '+' : ''}
                          {result.profit.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">{result.trades}</TableCell>
                        <TableCell align="right">{result.winRate}%</TableCell>
                        <TableCell align="right">{result.profitFactor}</TableCell>
                        <TableCell align="right">{result.maxDrawdown}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Item>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default BacktestingPage; 