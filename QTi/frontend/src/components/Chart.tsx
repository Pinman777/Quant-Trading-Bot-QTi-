import React, { useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme
} from '@mui/material';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartData {
  time: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  title: string;
  height?: number;
}

const Chart: React.FC<ChartProps> = ({
  data,
  title,
  height = 400
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
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
    });

    const lineSeries = chart.addLineSeries({
      color: theme.palette.primary.main,
      lineWidth: 2,
    });

    lineSeries.setData(data);

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
  }, [data, height, theme]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box ref={chartContainerRef} />
      </CardContent>
    </Card>
  );
};

export default Chart; 