import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TechnicalIndicatorsProps {
  symbol: string;
  timeframe: string;
}

interface IndicatorData {
  timestamp: string;
  value: number;
}

interface Indicators {
  rsi: IndicatorData[];
  macd: {
    macd: IndicatorData[];
    signal: IndicatorData[];
    histogram: IndicatorData[];
  };
  bollinger: {
    upper: IndicatorData[];
    middle: IndicatorData[];
    lower: IndicatorData[];
  };
  stoch: {
    k: IndicatorData[];
    d: IndicatorData[];
  };
  adx: IndicatorData[];
  obv: IndicatorData[];
  ichimoku: {
    tenkan: IndicatorData[];
    kijun: IndicatorData[];
    senkouA: IndicatorData[];
    senkouB: IndicatorData[];
    chikou: IndicatorData[];
  };
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ symbol, timeframe }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi', 'macd']);

  useEffect(() => {
    const fetchIndicators = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/market/indicators/${symbol}?timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error('Failed to fetch indicators');
        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch indicators');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [symbol, timeframe]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
    },
  };

  const renderIndicator = (indicator: string) => {
    if (!indicators) return null;

    switch (indicator) {
      case 'rsi':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>RSI</Typography>
            <Line
              data={{
                labels: indicators.rsi.map(d => d.timestamp),
                datasets: [{
                  label: 'RSI',
                  data: indicators.rsi.map(d => d.value),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                }],
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales?.y,
                    min: 0,
                    max: 100,
                  },
                },
              }}
            />
          </Paper>
        );

      case 'macd':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>MACD</Typography>
            <Line
              data={{
                labels: indicators.macd.macd.map(d => d.timestamp),
                datasets: [
                  {
                    label: 'MACD',
                    data: indicators.macd.macd.map(d => d.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                  {
                    label: 'Signal',
                    data: indicators.macd.signal.map(d => d.value),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                  {
                    label: 'Histogram',
                    data: indicators.macd.histogram.map(d => d.value),
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Paper>
        );

      case 'bollinger':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Bollinger Bands</Typography>
            <Line
              data={{
                labels: indicators.bollinger.upper.map(d => d.timestamp),
                datasets: [
                  {
                    label: 'Upper Band',
                    data: indicators.bollinger.upper.map(d => d.value),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                  {
                    label: 'Middle Band',
                    data: indicators.bollinger.middle.map(d => d.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                  {
                    label: 'Lower Band',
                    data: indicators.bollinger.lower.map(d => d.value),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Paper>
        );

      case 'stoch':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Stochastic Oscillator</Typography>
            <Line
              data={{
                labels: indicators.stoch.k.map(d => d.timestamp),
                datasets: [
                  {
                    label: '%K',
                    data: indicators.stoch.k.map(d => d.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                  {
                    label: '%D',
                    data: indicators.stoch.d.map(d => d.value),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales?.y,
                    min: 0,
                    max: 100,
                  },
                },
              }}
            />
          </Paper>
        );

      case 'adx':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>ADX</Typography>
            <Line
              data={{
                labels: indicators.adx.map(d => d.timestamp),
                datasets: [{
                  label: 'ADX',
                  data: indicators.adx.map(d => d.value),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                }],
              }}
              options={chartOptions}
            />
          </Paper>
        );

      case 'obv':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>On-Balance Volume (OBV)</Typography>
            <Line
              data={{
                labels: indicators.obv.map(d => d.timestamp),
                datasets: [{
                  label: 'OBV',
                  data: indicators.obv.map(d => d.value),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                }],
              }}
              options={chartOptions}
            />
          </Paper>
        );

      case 'ichimoku':
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Ichimoku Cloud</Typography>
            <Line
              data={{
                labels: indicators.ichimoku.tenkan.map(d => d.timestamp),
                datasets: [
                  {
                    label: 'Tenkan-sen',
                    data: indicators.ichimoku.tenkan.map(d => d.value),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                  },
                  {
                    label: 'Kijun-sen',
                    data: indicators.ichimoku.kijun.map(d => d.value),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  },
                  {
                    label: 'Senkou Span A',
                    data: indicators.ichimoku.senkouA.map(d => d.value),
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1,
                  },
                  {
                    label: 'Senkou Span B',
                    data: indicators.ichimoku.senkouB.map(d => d.value),
                    borderColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                  },
                  {
                    label: 'Chikou Span',
                    data: indicators.ichimoku.chikou.map(d => d.value),
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Paper>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Indicators</InputLabel>
        <Select
          multiple
          value={selectedIndicators}
          onChange={(e) => setSelectedIndicators(e.target.value as string[])}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          <MenuItem value="rsi">RSI</MenuItem>
          <MenuItem value="macd">MACD</MenuItem>
          <MenuItem value="bollinger">Bollinger Bands</MenuItem>
          <MenuItem value="stoch">Stochastic Oscillator</MenuItem>
          <MenuItem value="adx">ADX</MenuItem>
          <MenuItem value="obv">On-Balance Volume</MenuItem>
          <MenuItem value="ichimoku">Ichimoku Cloud</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {selectedIndicators.map((indicator) => (
          <Grid item xs={12} key={indicator}>
            {renderIndicator(indicator)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TechnicalIndicators; 