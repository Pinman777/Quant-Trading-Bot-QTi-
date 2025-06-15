import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Box, Paper, Typography } from '@mui/material';

interface CandlestickChartProps {
  data: CandlestickData[];
  title?: string;
  height?: number;
  width?: number;
  onTimeRangeChange?: (from: number, to: number) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  title,
  height = 400,
  width = 800,
  onTimeRangeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#FFFFFF' },
          textColor: '#1A2B44',
        },
        grid: {
          vertLines: { color: '#F0F0F0' },
          horzLines: { color: '#F0F0F0' },
        },
        width,
        height,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: '#E0E0E0',
        },
        rightPriceScale: {
          borderColor: '#E0E0E0',
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#1A2B44',
            style: 1,
            width: 1,
          },
          horzLine: {
            color: '#1A2B44',
            style: 1,
            width: 1,
          },
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00C4B4',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#00C4B4',
        wickDownColor: '#FF5252',
      });

      candlestickSeries.setData(data);

      // Добавляем индикаторы
      const sma20 = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        title: 'SMA 20',
      });

      const sma50 = chart.addLineSeries({
        color: '#FF6D00',
        lineWidth: 2,
        title: 'SMA 50',
      });

      // Рассчитываем SMA
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

      sma20.setData(calculateSMA(data, 20));
      sma50.setData(calculateSMA(data, 50));

      // Обработка изменения временного диапазона
      chart.timeScale().subscribeVisibleTimeRangeChange((param) => {
        if (onTimeRangeChange) {
          onTimeRangeChange(param.from, param.to);
        }
      });

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      return () => {
        chart.remove();
      };
    }
  }, [data, width, height, onTimeRangeChange]);

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      <Box ref={chartContainerRef} />
    </Paper>
  );
}; 