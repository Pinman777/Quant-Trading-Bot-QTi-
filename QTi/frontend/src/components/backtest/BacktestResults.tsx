import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Download as DownloadIcon } from '@mui/icons-material';

interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
}

interface BacktestResult {
  id: string;
  config: {
    name: string;
    exchange: string;
    symbol: string;
    strategy: string;
    timeframe: string;
  };
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalReturn: number;
    annualizedReturn: number;
  };
  trades: Trade[];
  equity: {
    timestamp: string;
    value: number;
  }[];
  createdAt: string;
}

interface BacktestResultsProps {
  result: BacktestResult;
  loading?: boolean;
  error?: string;
  onDownload?: () => void;
}

const BacktestResults: React.FC<BacktestResultsProps> = ({
  result,
  loading = false,
  error,
  onDownload,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current && result.equity.length > 0) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const equitySeries = chart.addAreaSeries({
        lineColor: '#00C4B4',
        topColor: 'rgba(0, 196, 180, 0.3)',
        bottomColor: 'rgba(0, 196, 180, 0.0)',
      });

      const data = result.equity.map((point) => ({
        time: new Date(point.timestamp).getTime() / 1000,
        value: point.value,
      }));

      equitySeries.setData(data);

      // Add trade markers
      result.trades.forEach((trade) => {
        const marker = {
          time: new Date(trade.timestamp).getTime() / 1000,
          position: trade.type === 'buy' ? 'aboveBar' : 'belowBar',
          color: trade.type === 'buy' ? '#00C4B4' : '#FF5252',
          shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
          text: `${trade.type.toUpperCase()} ${trade.quantity} @ ${trade.price}`,
        };
        equitySeries.setMarkers([marker]);
      });

      chart.timeScale().fitContent();

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
  }, [result]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Backtest Results: {result.config.name}
        </Typography>
        {onDownload && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
          >
            Download Results
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Exchange
                </Typography>
                <Typography variant="body1">
                  {result.config.exchange.toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Symbol
                </Typography>
                <Typography variant="body1">
                  {result.config.symbol}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Strategy
                </Typography>
                <Typography variant="body1">
                  {result.config.strategy}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Timeframe
                </Typography>
                <Typography variant="body1">
                  {result.config.timeframe}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Return
                </Typography>
                <Typography
                  variant="h6"
                  color={result.performance.totalReturn >= 0 ? 'success.main' : 'error.main'}
                >
                  {result.performance.totalReturn.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Win Rate
                </Typography>
                <Typography variant="h6">
                  {result.performance.winRate.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Profit Factor
                </Typography>
                <Typography variant="h6">
                  {result.performance.profitFactor.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Sharpe Ratio
                </Typography>
                <Typography variant="h6">
                  {result.performance.sharpeRatio.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Max Drawdown
                </Typography>
                <Typography variant="h6" color="error.main">
                  {result.performance.maxDrawdown.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Trades
                </Typography>
                <Typography variant="h6">
                  {result.performance.totalTrades}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Winning Trades
                </Typography>
                <Typography variant="h6" color="success.main">
                  {result.performance.winningTrades}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Losing Trades
                </Typography>
                <Typography variant="h6" color="error.main">
                  {result.performance.losingTrades}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Equity Curve
            </Typography>
            <Box ref={chartContainerRef} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trade History
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.trades.map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(trade.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={trade.type === 'buy' ? 'success.main' : 'error.main'}
                        >
                          {trade.type.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {trade.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {trade.quantity.toFixed(4)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: trade.pnl >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {trade.pnl.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BacktestResults; 