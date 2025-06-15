import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Box } from '@mui/material';

interface PerformanceChartProps {
  data: {
    time: string;
    value: number;
  }[];
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  height = 400,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
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
        height,
      });

      const lineSeries = chart.addLineSeries({
        color: '#2196f3',
        lineWidth: 2,
      });

      lineSeries.setData(data);

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
  }, [data, height]);

  return (
    <Box
      ref={chartContainerRef}
      sx={{
        width: '100%',
        height,
        '& .tv-lightweight-charts': {
          width: '100%',
          height: '100%',
        },
      }}
    />
  );
};

export default PerformanceChart; 