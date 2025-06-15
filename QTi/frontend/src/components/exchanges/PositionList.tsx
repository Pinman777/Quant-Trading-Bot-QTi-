import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { exchangeService } from '../../services/exchange';
import {
  ExchangeType,
  Position
} from '../../types/exchange';

interface PositionListProps {
  exchange: ExchangeType;
  symbol?: string;
}

export const PositionList: React.FC<PositionListProps> = ({ exchange, symbol }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPositions = async () => {
    try {
      setLoading(true);
      setError(null);

      const positions = await exchangeService.getPositions(exchange, symbol);
      setPositions(positions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPositions();
    const interval = setInterval(loadPositions, 5000); // Обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, [exchange, symbol]);

  if (loading && positions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Positions</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={loadPositions}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>Entry Price</TableCell>
                  <TableCell>Mark Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Leverage</TableCell>
                  <TableCell>Margin Type</TableCell>
                  <TableCell>Liquidation Price</TableCell>
                  <TableCell>Unrealized PnL</TableCell>
                  <TableCell>Realized PnL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={`${position.symbol}-${position.side}`}>
                    <TableCell>{position.symbol}</TableCell>
                    <TableCell>
                      <Chip
                        label={position.side.toUpperCase()}
                        size="small"
                        color={position.side === 'long' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{position.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>{position.markPrice.toFixed(2)}</TableCell>
                    <TableCell>{position.quantity.toFixed(4)}</TableCell>
                    <TableCell>{position.leverage}x</TableCell>
                    <TableCell>
                      <Chip
                        label={position.marginType.toUpperCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{position.liquidationPrice.toFixed(2)}</TableCell>
                    <TableCell
                      sx={{
                        color: position.unrealizedPnL >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        {position.unrealizedPnL >= 0 ? (
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                          color={position.unrealizedPnL >= 0 ? 'success.main' : 'error.main'}
                          ml={0.5}
                        >
                          {position.unrealizedPnL.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: position.realizedPnL >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        {position.realizedPnL >= 0 ? (
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                          color={position.realizedPnL >= 0 ? 'success.main' : 'error.main'}
                          ml={0.5}
                        >
                          {position.realizedPnL.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}; 