import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  total: number;
  profit?: number;
  profitPercentage?: number;
  timestamp: string;
}

interface RecentTradesProps {
  trades: Trade[];
}

const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Trades
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Side</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Profit</TableCell>
              <TableCell align="right">Profit %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>
                  {new Date(trade.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>
                  <Chip
                    label={trade.side}
                    color={trade.side === 'buy' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  ${trade.price.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {trade.size.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  ${trade.total.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      trade.profit && trade.profit > 0
                        ? 'success.main'
                        : trade.profit && trade.profit < 0
                        ? 'error.main'
                        : 'inherit',
                  }}
                >
                  {trade.profit ? (
                    <>
                      {trade.profit > 0 ? '+' : ''}$
                      {trade.profit.toLocaleString()}
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      trade.profitPercentage && trade.profitPercentage > 0
                        ? 'success.main'
                        : trade.profitPercentage && trade.profitPercentage < 0
                        ? 'error.main'
                        : 'inherit',
                  }}
                >
                  {trade.profitPercentage ? (
                    <>
                      {trade.profitPercentage > 0 ? '+' : ''}
                      {trade.profitPercentage.toFixed(2)}%
                    </>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No recent trades
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentTrades; 