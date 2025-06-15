import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramSeriesOptions } from 'lightweight-charts';
import { Box, Paper, Typography, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

interface TechnicalAnalysisProps {
  symbol: string;
  timeframe: string;
  indicators: { name: string; params: Record<string, number | string> }[];
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ symbol, timeframe, indicators }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<"Histogram"> | null>(null);
  const [indicatorSeries, setIndicatorSeries] = useState<Record<string, ISeriesApi<"Line">>>({});

  useEffect(() => {
    if (chartContainerRef.current) {
      const newChart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1A2B44' },
          textColor: '#FFFFFF',
        },
        grid: {
          vertLines: { color: '#2B3B54' },
          horzLines: { color: '#2B3B54' },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });

      const newCandlestickSeries = newChart.addCandlestickSeries({
        upColor: '#00C4B4',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#00C4B4',
        wickDownColor: '#FF5252',
      });

      const newVolumeSeries = newChart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      } as HistogramSeriesOptions);

      setChart(newChart);
      setCandlestickSeries(newCandlestickSeries);
      setVolumeSeries(newVolumeSeries);

      return () => {
        newChart.remove();
      };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/market/historical`, {
          params: {
            symbol,
            timeframe,
          },
        });

        const { data } = response;
        const candlestickData = data.map((item: any) => ({
          time: item.timestamp / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        const volumeData = data.map((item: any) => ({
          time: item.timestamp / 1000,
          value: item.volume,
          color: item.close >= item.open ? '#00C4B4' : '#FF5252',
        }));

        if (candlestickSeries) {
          candlestickSeries.setData(candlestickData);
        }

        if (volumeSeries) {
          volumeSeries.setData(volumeData);
        }

        // Calculate and add indicators
        indicators.forEach((indicator) => {
          const indicatorData = calculateIndicator(candlestickData, indicator);
          if (indicatorData) {
            if (indicatorSeries[indicator.name]) {
              indicatorSeries[indicator.name].setData(indicatorData);
            } else if (chart) {
              const newSeries = chart.addLineSeries({
                color: getIndicatorColor(indicator.name),
                lineWidth: 2,
              });
              newSeries.setData(indicatorData);
              setIndicatorSeries(prev => ({
                ...prev,
                [indicator.name]: newSeries
              }));
            }
          }
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchData();
  }, [symbol, timeframe, indicators]);

  const calculateIndicator = (data: CandlestickData[], indicator: { name: string; params: Record<string, number | string> }) => {
    switch (indicator.name) {
      case 'SMA':
        return calculateSMA(data, Number(indicator.params.period));
      case 'EMA':
        return calculateEMA(data, Number(indicator.params.period));
      case 'RSI':
        return calculateRSI(data, Number(indicator.params.period));
      case 'MACD':
        return calculateMACD(
          data,
          Number(indicator.params.fastPeriod),
          Number(indicator.params.slowPeriod),
          Number(indicator.params.signalPeriod)
        );
      case 'Bollinger Bands':
        return calculateBollingerBands(
          data,
          Number(indicator.params.period),
          Number(indicator.params.stdDev)
        );
      default:
        return null;
    }
  };

  const getIndicatorColor = (name: string): string => {
    const colors: Record<string, string> = {
      SMA: '#FFD700',
      EMA: '#00BFFF',
      RSI: '#FF69B4',
      MACD: '#32CD32',
      'Bollinger Bands': '#FFA500',
    };
    return colors[name] || '#FFFFFF';
  };

  // Indicator calculation functions
  const calculateSMA = (data: CandlestickData[], period: number) => {
    const smaData = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
      smaData.push({
        time: data[i].time,
        value: sum / period,
      });
    }
    return smaData;
  };

  const calculateEMA = (data: CandlestickData[], period: number) => {
    const k = 2 / (period + 1);
    const emaData = [];
    let ema = data[0].close;

    for (let i = 1; i < data.length; i++) {
      ema = data[i].close * k + ema * (1 - k);
      emaData.push({
        time: data[i].time,
        value: ema,
      });
    }
    return emaData;
  };

  const calculateRSI = (data: CandlestickData[], period: number) => {
    const rsiData = [];
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI for the rest of the data
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }

      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      rsiData.push({
        time: data[i].time,
        value: rsi,
      });
    }
    return rsiData;
  };

  const calculateMACD = (data: CandlestickData[], fastPeriod: number, slowPeriod: number, signalPeriod: number) => {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);
    const macdLine = fastEMA.map((fast, i) => ({
      time: fast.time,
      value: fast.value - slowEMA[i].value,
    }));

    const signalLine = calculateEMA(macdLine, signalPeriod);
    return signalLine;
  };

  const calculateBollingerBands = (data: CandlestickData[], period: number, stdDev: number) => {
    const sma = calculateSMA(data, period);
    const bands = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1].value;
      const squaredDiffs = slice.map(d => Math.pow(d.close - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const standardDeviation = Math.sqrt(variance);

      bands.push({
        time: data[i].time,
        value: mean + standardDeviation * stdDev,
      });
    }
    return bands;
  };

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: '#1A2B44' }}>
      <Typography variant="h6" color="white" gutterBottom>
        {symbol} - {timeframe}
      </Typography>
      <Box ref={chartContainerRef} sx={{ width: '100%', height: '100%' }} />
    </Paper>
  );
};

export default TechnicalAnalysis; 