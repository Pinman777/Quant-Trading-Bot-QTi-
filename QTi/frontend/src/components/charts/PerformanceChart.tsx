import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

interface PerformanceChartProps {
  data: {
    time: string;
    value: number;
  }[];
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#1A2B44' },
          textColor: '#DDD',
        },
        grid: {
          vertLines: { color: '#2B3B4C' },
          horzLines: { color: '#2B3B4C' },
        },
        width: chartContainerRef.current.clientWidth,
        height,
      });

      const lineSeries = chart.addLineSeries({
        color: '#00C4B4',
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
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    />
  );
};

export default PerformanceChart; 