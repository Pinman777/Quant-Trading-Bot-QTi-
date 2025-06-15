import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Tooltip
} from '@mui/material';

interface PerformanceData {
  symbol: string;
  timeframe: string;
  profit: number;
  winRate: number;
  trades: number;
}

interface PerformanceHeatmapProps {
  data: PerformanceData[];
  onCellClick?: (symbol: string, timeframe: string) => void;
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  data,
  onCellClick
}) => {
  const theme = useTheme();

  // Get unique symbols and timeframes
  const symbols = Array.from(new Set(data.map((d) => d.symbol))).sort();
  const timeframes = Array.from(new Set(data.map((d) => d.timeframe))).sort();

  // Create a map for quick lookup
  const dataMap = new Map(
    data.map((d) => [`${d.symbol}-${d.timeframe}`, d])
  );

  const getColor = (profit: number) => {
    const maxProfit = Math.max(...data.map((d) => Math.abs(d.profit)));
    const normalizedProfit = profit / maxProfit;
    const color = profit >= 0 ? theme.palette.success.main : theme.palette.error.main;
    const opacity = Math.min(Math.abs(normalizedProfit) + 0.3, 1);
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Heatmap
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `auto ${timeframes.map(() => '1fr').join(' ')}`,
            gap: 1,
            overflowX: 'auto'
          }}
        >
          {/* Header row */}
          <Box sx={{ p: 1 }} />
          {timeframes.map((tf) => (
            <Box
              key={tf}
              sx={{
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              {tf}
            </Box>
          ))}

          {/* Data rows */}
          {symbols.map((symbol) => (
            <React.Fragment key={symbol}>
              <Box
                sx={{
                  p: 1,
                  fontWeight: 'bold',
                  borderRight: 1,
                  borderColor: 'divider'
                }}
              >
                {symbol}
              </Box>
              {timeframes.map((tf) => {
                const cellData = dataMap.get(`${symbol}-${tf}`);
                if (!cellData) {
                  return (
                    <Box
                      key={`${symbol}-${tf}`}
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        backgroundColor: theme.palette.action.hover
                      }}
                    />
                  );
                }

                return (
                  <Tooltip
                    key={`${symbol}-${tf}`}
                    title={
                      <Box>
                        <Typography variant="body2">
                          Profit: {formatNumber(cellData.profit)}
                        </Typography>
                        <Typography variant="body2">
                          Win Rate: {formatPercentage(cellData.winRate)}
                        </Typography>
                        <Typography variant="body2">
                          Trades: {cellData.trades}
                        </Typography>
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        backgroundColor: getColor(cellData.profit),
                        color: theme.palette.getContrastText(getColor(cellData.profit)),
                        cursor: onCellClick ? 'pointer' : 'default',
                        '&:hover': onCellClick
                          ? {
                              opacity: 0.8
                            }
                          : {}
                      }}
                      onClick={() => onCellClick?.(symbol, tf)}
                    >
                      {formatNumber(cellData.profit)}
                    </Box>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}; 