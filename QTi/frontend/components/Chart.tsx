import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData } from 'lightweight-charts';
import { Box, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ChartProps {
  data: ChartData[];
  height?: number;
  showVolume?: boolean;
}

interface Indicator {
  name: string;
  calculate: (data: CandlestickData[]) => { time: string; value: number }[];
  color: string;
}

export const Chart: React.FC<ChartProps> = ({ 
  data, 
  height = 400,
  showVolume = true 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('SMA');
  const theme = useTheme();

  const indicators: Record<string, Indicator> = {
    SMA: {
      name: 'SMA',
      calculate: (data) => calculateSMA(data, 20),
      color: '#2962FF',
    },
    EMA: {
      name: 'EMA',
      calculate: (data) => calculateEMA(data, 20),
      color: '#FF6B6B',
    },
    RSI: {
      name: 'RSI',
      calculate: (data) => calculateRSI(data, 14),
      color: '#4CAF50',
    },
    MACD: {
      name: 'MACD',
      calculate: (data) => calculateMACD(data),
      color: '#9C27B0',
    },
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { 
            type: ColorType.Solid, 
            color: theme.palette.mode === 'dark' ? '#1A1F2C' : '#FFFFFF' 
          },
          textColor: theme.palette.mode === 'dark' ? '#DDD' : '#333',
        },
        grid: {
          vertLines: { 
            color: theme.palette.mode === 'dark' ? '#2A2F3C' : '#E0E0E0' 
          },
          horzLines: { 
            color: theme.palette.mode === 'dark' ? '#2A2F3C' : '#E0E0E0' 
          },
        },
        width: chartContainerRef.current.clientWidth,
        height,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00C4B4',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#00C4B4',
        wickDownColor: '#FF5252',
      });

      candlestickSeries.setData(data);

      // Добавляем выбранный индикатор
      const indicator = indicators[selectedIndicator];
      if (indicator) {
        const indicatorData = indicator.calculate(data);
        const indicatorSeries = chart.addLineSeries({
          color: indicator.color,
          lineWidth: 2,
        });
        indicatorSeries.setData(indicatorData);
      }

      // Добавляем объем, если включен
      if (showVolume && data[0].volume) {
        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });
        const volumeData: HistogramData[] = data.map(d => ({
          time: d.time,
          value: d.volume || 0,
          color: d.close >= d.open ? '#00C4B4' : '#FF5252',
        }));
        volumeSeries.setData(volumeData);
        
        // Настраиваем масштаб для объема
        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
      }

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
  }, [data, height, selectedIndicator, showVolume, theme.palette.mode]);

  const handleIndicatorChange = (event: SelectChangeEvent) => {
    setSelectedIndicator(event.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedIndicator}
            onChange={handleIndicatorChange}
            displayEmpty
          >
            {Object.keys(indicators).map((key) => (
              <MenuItem key={key} value={key}>
                {indicators[key].name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        ref={chartContainerRef}
        sx={{
          width: '100%',
          height,
          backgroundColor: theme.palette.mode === 'dark' ? '#1A1F2C' : '#FFFFFF',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      />
    </Box>
  );
};

function calculateSMA(
  data: CandlestickData[],
  period: number
): { time: string; value: number }[] {
  const smaData: { time: string; value: number }[] = [];
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period - 1) {
      smaData.push({
        time: data[i].time as string,
        value: sum / period,
      });
      sum -= data[i - period + 1].close;
    }
  }

  return smaData;
}

function calculateEMA(
  data: CandlestickData[],
  period: number
): { time: string; value: number }[] {
  const emaData: { time: string; value: number }[] = [];
  const multiplier = 2 / (period + 1);
  let ema = data[0].close;

  for (let i = 0; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    emaData.push({
      time: data[i].time as string,
      value: ema,
    });
  }

  return emaData;
}

function calculateRSI(
  data: CandlestickData[],
  period: number
): { time: string; value: number }[] {
  const rsiData: { time: string; value: number }[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }

    if (i >= period) {
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));

      rsiData.push({
        time: data[i].time as string,
        value: rsi,
      });

      const prevChange = data[i - period + 1].close - data[i - period].close;
      if (prevChange >= 0) {
        gains -= prevChange;
      } else {
        losses += prevChange;
      }
    }
  }

  return rsiData;
}

function calculateMACD(
  data: CandlestickData[]
): { time: string; value: number }[] {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdData: { time: string; value: number }[] = [];

  for (let i = 0; i < ema12.length; i++) {
    if (i < 26) continue; // Пропускаем первые 26 точек
    macdData.push({
      time: ema12[i].time,
      value: ema12[i].value - ema26[i].value,
    });
  }

  return macdData;
} 