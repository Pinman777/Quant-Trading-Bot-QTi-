import React, { useEffect, useRef } from 'react';
import {
  Card,
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

interface MarketOverviewProps {
  marketData: MarketData[];
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({
  marketData,
  selectedSymbol,
  onSymbolSelect,
  timeframe,
  onTimeframeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1A2B44' },
          textColor: '#FFFFFF',
        },
        grid: {
          vertLines: { color: '#2B3B4E' },
          horzLines: { color: '#2B3B4E' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00C4B4',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#00C4B4',
        wickDownColor: '#FF5252',
      });

      // TODO: Add real market data
      const sampleData = [
        { time: '2024-01-01', open: 100, high: 105, low: 98, close: 103 },
        { time: '2024-01-02', open: 103, high: 107, low: 101, close: 105 },
        { time: '2024-01-03', open: 105, high: 108, low: 103, close: 106 },
      ];

      candlestickSeries.setData(sampleData);

      chartRef.current = chart;

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [selectedSymbol, timeframe]);

  const getChangeColor = (change: number) => {
    return change >= 0 ? '#00C4B4' : '#FF5252';
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Рыночный обзор
            </Typography>
            <Box ref={chartContainerRef} />
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Топ криптовалют
            </Typography>
            <Grid container spacing={2}>
              {marketData.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.symbol}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">{item.symbol}</Typography>
                      <Typography
                        variant="h5"
                        color={item.change24h >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${item.price.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {item.change24h >= 0 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={item.change24h >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        24h Volume: ${item.volume24h.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Market Cap: ${item.marketCap.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MarketOverview; 