import React, { useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
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
} from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import TradingChart from './TradingChart';
import { createChart, ColorType } from 'lightweight-charts';

interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  size: number;
  profit: number;
}

interface BacktestResult {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  averageProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: { timestamp: string; equity: number }[];
  trades: Trade[];
  candles: Array<{
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface BacktestResultsProps {
  result: BacktestResult;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ result }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

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

      const equitySeries = chart.addAreaSeries({
        lineColor: '#00C4B4',
        topColor: '#00C4B4',
        bottomColor: 'rgba(0, 196, 180, 0.1)',
      });

      equitySeries.setData(
        result.equityCurve.map((point) => ({
          time: new Date(point.timestamp).getTime() / 1000,
          value: point.equity,
        }))
      );

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
  }, [result.equityCurve]);

  const profitColor = result.totalProfit >= 0 ? 'success.main' : 'error.main';
  const profitIcon = result.totalProfit >= 0 ? <TrendingUp /> : <TrendingDown />;
  const balanceProgress = (result.finalBalance / result.initialBalance) * 100;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Backtest Results: {result.symbol} ({result.timeframe})
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Period: {new Date(result.startDate).toLocaleDateString()} -{' '}
          {new Date(result.endDate).toLocaleDateString()}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box ref={chartContainerRef} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Total Profit</TableCell>
                    <TableCell align="right">
                      {result.totalProfit.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Win Rate</TableCell>
                    <TableCell align="right">
                      {result.winRate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Trades</TableCell>
                    <TableCell align="right">{result.totalTrades}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Profit</TableCell>
                    <TableCell align="right">
                      {result.averageProfit.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Max Drawdown</TableCell>
                    <TableCell align="right">
                      {result.maxDrawdown.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sharpe Ratio</TableCell>
                    <TableCell align="right">
                      {result.sharpeRatio.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Trade History
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Size</TableCell>
                    <TableCell align="right">Profit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.trades.map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(trade.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            trade.type === 'buy'
                              ? '#00C4B4'
                              : '#FF5252',
                        }}
                      >
                        {trade.type.toUpperCase()}
                      </TableCell>
                      <TableCell align="right">
                        {trade.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {trade.size.toFixed(4)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            trade.profit >= 0
                              ? '#00C4B4'
                              : '#FF5252',
                        }}
                      >
                        {trade.profit.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 