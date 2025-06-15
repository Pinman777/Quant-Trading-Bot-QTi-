import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface CandlestickChartProps {
  symbol: string;
  timeframe: string;
  height?: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  timeframe,
  height = 500
}) => {
  const theme = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<"Histogram"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (chartContainerRef.current) {
      const newChart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: theme.palette.background.paper },
          textColor: theme.palette.text.primary,
        },
        grid: {
          vertLines: { color: theme.palette.divider },
          horzLines: { color: theme.palette.divider },
        },
        width: chartContainerRef.current.clientWidth,
        height,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const newCandlestickSeries = newChart.addCandlestickSeries({
        upColor: theme.palette.success.main,
        downColor: theme.palette.error.main,
        borderVisible: false,
        wickUpColor: theme.palette.success.main,
        wickDownColor: theme.palette.error.main,
      });

      const newVolumeSeries = newChart.addHistogramSeries({
        color: theme.palette.primary.main,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      setChart(newChart);
      setCandlestickSeries(newCandlestickSeries);
      setVolumeSeries(newVolumeSeries);

      return () => {
        newChart.remove();
      };
    }
  }, [theme, height]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/market/historical/${symbol}?days=30`);
        if (!response.ok) throw new Error('Failed to fetch chart data');
        const chartData = await response.json();
        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (candlestickSeries && volumeSeries && data.length > 0) {
      const candlestickData = data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      const volumeData = data.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? theme.palette.success.main : theme.palette.error.main,
      }));

      candlestickSeries.setData(candlestickData);
      volumeSeries.setData(volumeData);
    }
  }, [candlestickSeries, volumeSeries, data, theme]);

  useEffect(() => {
    const handleResize = () => {
      if (chart && chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chart]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2">
          {symbol} - {timeframe}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          ref={chartContainerRef}
          sx={{
            width: '100%',
            height,
            position: 'relative',
          }}
        />
      )}
    </Paper>
  );
};

export default CandlestickChart; 