import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { BotTrade } from '../types/bot';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  trades: BotTrade[];
  candles: CandlestickData[];
  indicators?: {
    name: string;
    data: { time: string; value: number }[];
    color: string;
  }[];
}

const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  timeframe,
  trades,
  candles,
  indicators = []
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const indicatorSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(candles);
    candlestickSeriesRef.current = candlestickSeries;

    // Add indicator series
    indicatorSeriesRefs.current = indicators.map(indicator => {
      const series = chart.addLineSeries({
        color: indicator.color,
        lineWidth: 2,
      });
      series.setData(indicator.data);
      return series;
    });

    // Add trade markers
    trades.forEach(trade => {
      const marker = {
        time: trade.entryTime,
        position: trade.side === 'buy' ? 'aboveBar' : 'belowBar',
        color: trade.side === 'buy' ? '#26a69a' : '#ef5350',
        shape: trade.side === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${trade.side.toUpperCase()} ${trade.quantity}`,
      };
      candlestickSeries.setMarkers([marker]);
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, trades, indicators]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        ref={chartContainerRef}
        sx={{
          width: '100%',
          height: 500,
          position: 'relative',
        }}
      />
    </Paper>
  );
};

export default TradingChart; 