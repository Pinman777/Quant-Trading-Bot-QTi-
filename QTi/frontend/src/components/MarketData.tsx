import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Star,
  StarBorder,
} from '@mui/icons-material';
import TradingChart from './TradingChart';
import { marketApi } from '../services/api';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  candles: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface MarketDataProps {
  onSelectSymbol: (symbol: string) => void;
}

export default function MarketData({ onSelectSymbol }: MarketDataProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const response = await marketApi.getSymbols();
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchMarketData();
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toString();
  };

  const selectedData = marketData.find((data) => data.symbol === selectedSymbol);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Рыночные данные</Typography>
              <Tooltip title="Обновить">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ранг</TableCell>
                    <TableCell>Символ</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Изменение 24ч</TableCell>
                    <TableCell align="right">Объем 24ч</TableCell>
                    <TableCell align="right">Капитализация</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketData.map((data) => (
                    <TableRow
                      key={data.symbol}
                      hover
                      onClick={() => {
                        setSelectedSymbol(data.symbol);
                        onSelectSymbol(data.symbol);
                      }}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor:
                          selectedSymbol === data.symbol
                            ? 'action.selected'
                            : 'inherit',
                      }}
                    >
                      <TableCell>{data.rank}</TableCell>
                      <TableCell>{data.symbol}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(data.price)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            data.priceChange24h >= 0
                              ? 'success.main'
                              : 'error.main',
                        }}
                      >
                        {data.priceChange24h >= 0 ? (
                          <TrendingUp fontSize="small" />
                        ) : (
                          <TrendingDown fontSize="small" />
                        )}
                        {formatNumber(Math.abs(data.priceChange24h))}%
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(data.volume24h)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(data.marketCap)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(data.symbol);
                          }}
                        >
                          {favorites.includes(data.symbol) ? (
                            <Star color="primary" />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {selectedData && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedData.name} ({selectedData.symbol})
              </Typography>
              <Box sx={{ height: 400 }}>
                <TradingChart
                  data={selectedData.candles.map((candle) => ({
                    time: new Date(candle.timestamp).toISOString(),
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                  }))}
                />
              </Box>
              <Grid container spacing={2} mt={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Текущая цена
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedData.price)}
                      </Typography>
                      <Chip
                        size="small"
                        icon={
                          selectedData.priceChange24h >= 0 ? (
                            <TrendingUp />
                          ) : (
                            <TrendingDown />
                          )
                        }
                        label={`${formatNumber(
                          Math.abs(selectedData.priceChange24h)
                        )}%`}
                        color={
                          selectedData.priceChange24h >= 0
                            ? 'success'
                            : 'error'
                        }
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Объем 24ч
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedData.volume24h)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Рыночная капитализация
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedData.marketCap)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
} 