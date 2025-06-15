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
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  Warning,
} from '@mui/icons-material';
import { createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

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
  parameters: {
    gridSize: number;
    gridSpacing: number;
    maxPositions: number;
    stopLoss: number;
    takeProfit: number;
  };
  equityCurve: {
    timestamp: string;
    equity: number;
  }[];
  trades: {
    timestamp: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    profit: number;
  }[];
}

interface OptimizationResultsProps {
  results: OptimizationResult[];
  selectedResult: OptimizationResult | null;
  onSelectResult: (result: OptimizationResult) => void;
}

export default function OptimizationResults({
  results,
  selectedResult,
  onSelectResult,
}: OptimizationResultsProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (chartContainerRef.current && selectedResult) {
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

      const equitySeries = chart.addLineSeries({
        color: '#00C4B4',
        lineWidth: 2,
      });

      equitySeries.setData(
        selectedResult.equityCurve.map((point) => ({
          time: new Date(point.timestamp).getTime() / 1000,
          value: point.equity,
        }))
      );

      chart.timeScale().fitContent();
      chartRef.current = chart;

      return () => {
        chart.remove();
      };
    }
  }, [selectedResult]);

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? '#00C4B4' : '#FF5252';
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Результаты оптимизации
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Символ</TableCell>
                    <TableCell>Таймфрейм</TableCell>
                    <TableCell>Период</TableCell>
                    <TableCell>Прибыль</TableCell>
                    <TableCell>Винрейт</TableCell>
                    <TableCell>Сделки</TableCell>
                    <TableCell>Макс. просадка</TableCell>
                    <TableCell>Коэф. Шарпа</TableCell>
                    <TableCell>Параметры</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow
                      key={result.id}
                      onClick={() => onSelectResult(result)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor:
                          selectedResult?.id === result.id
                            ? 'rgba(0, 196, 180, 0.1)'
                            : 'inherit',
                      }}
                    >
                      <TableCell>{result.symbol}</TableCell>
                      <TableCell>{result.timeframe}</TableCell>
                      <TableCell>
                        {new Date(result.startDate).toLocaleDateString()} -{' '}
                        {new Date(result.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          color={getProfitColor(result.totalProfit)}
                        >
                          {getProfitIcon(result.totalProfit)}
                          <Typography ml={1}>
                            {result.totalProfit.toFixed(2)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography mr={1}>
                            {result.winRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={result.winRate}
                            sx={{
                              width: 50,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(0, 196, 180, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#00C4B4',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{result.totalTrades}</TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          color="#FF5252"
                        >
                          <TrendingDown />
                          <Typography ml={1}>
                            {result.maxDrawdown.toFixed(2)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.sharpeRatio.toFixed(2)}
                          color={
                            result.sharpeRatio >= 1
                              ? 'success'
                              : result.sharpeRatio >= 0
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            <Box>
                              <Typography>Grid Size: {result.parameters.gridSize}</Typography>
                              <Typography>
                                Grid Spacing: {result.parameters.gridSpacing}
                              </Typography>
                              <Typography>
                                Max Positions: {result.parameters.maxPositions}
                              </Typography>
                              <Typography>
                                Stop Loss: {result.parameters.stopLoss}%
                              </Typography>
                              <Typography>
                                Take Profit: {result.parameters.takeProfit}%
                              </Typography>
                            </Box>
                          }
                        >
                          <Chip
                            icon={<ShowChart />}
                            label="Параметры"
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {selectedResult && (
        <>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  График эквити
                </Typography>
                <Box
                  ref={chartContainerRef}
                  sx={{
                    width: '100%',
                    height: 400,
                    backgroundColor: '#1A2B44',
                    borderRadius: 1,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  История сделок
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Время</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Цена</TableCell>
                        <TableCell>Объем</TableCell>
                        <TableCell>Прибыль</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedResult.trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(trade.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={trade.type === 'buy' ? 'Покупка' : 'Продажа'}
                              color={trade.type === 'buy' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{trade.price.toFixed(2)}</TableCell>
                          <TableCell>{trade.quantity.toFixed(4)}</TableCell>
                          <TableCell>
                            <Box
                              display="flex"
                              alignItems="center"
                              color={getProfitColor(trade.profit)}
                            >
                              {getProfitIcon(trade.profit)}
                              <Typography ml={1}>
                                {trade.profit.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
} 