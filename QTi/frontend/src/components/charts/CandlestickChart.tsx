import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Box, Paper, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import {
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

interface CandlestickChartProps {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  height?: number;
  onTimeRangeChange?: (from: number, to: number) => void;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  timeframe,
  data,
  height = 400,
  onTimeRangeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chartInstance = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1A2B44' },
          textColor: '#FFFFFF',
        },
        grid: {
          vertLines: { color: '#2B3B54' },
          horzLines: { color: '#2B3B54' },
        },
        width: chartContainerRef.current.clientWidth,
        height,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: '#2B3B54',
        },
        rightPriceScale: {
          borderColor: '#2B3B54',
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: '#00C4B4',
            width: 1,
            style: 1,
          },
          horzLine: {
            color: '#00C4B4',
            width: 1,
            style: 1,
          },
        },
      });

      const series = chartInstance.addCandlestickSeries({
        upColor: '#00C4B4',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#00C4B4',
        wickDownColor: '#FF5252',
      });

      setChart(chartInstance);
      setCandlestickSeries(series);

      const handleResize = () => {
        if (chartContainerRef.current) {
          chartInstance.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.remove();
      };
    }
  }, [height]);

  useEffect(() => {
    if (candlestickSeries && data.length > 0) {
      candlestickSeries.setData(data);
    }
  }, [candlestickSeries, data]);

  useEffect(() => {
    if (chart && onTimeRangeChange) {
      chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
        if (range) {
          onTimeRangeChange(range.from, range.to);
        }
      });
    }
  }, [chart, onTimeRangeChange]);

  const handleRefresh = () => {
    setLoading(true);
    // TODO: Implement data refresh logic
    setTimeout(() => setLoading(false), 1000);
  };

  const handleZoomIn = () => {
    if (chart) {
      chart.timeScale().zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (chart) {
      chart.timeScale().zoomOut();
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: '#1A2B44',
        color: '#FFFFFF',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {symbol} - {timeframe}
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small" sx={{ color: '#FFFFFF' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: '#FFFFFF' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: '#FFFFFF' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton onClick={handleFullscreen} size="small" sx={{ color: '#FFFFFF' }}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'rgba(26, 43, 68, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress sx={{ color: '#00C4B4' }} />
        </Box>
      )}

      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: isFullscreen ? '100vh' : height,
        }}
      />
    </Paper>
  );
};

export default CandlestickChart; 