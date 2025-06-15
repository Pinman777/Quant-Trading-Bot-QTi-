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

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
  openTime: string;
}

interface OpenPositionsProps {
  positions: Position[];
}

const OpenPositions: React.FC<OpenPositionsProps> = ({ positions }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Open Positions
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Side</TableCell>
              <TableCell align="right">Entry Price</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell align="right">P&L %</TableCell>
              <TableCell>Open Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position.id}>
                <TableCell>{position.symbol}</TableCell>
                <TableCell>
                  <Chip
                    label={position.side}
                    color={position.side === 'long' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  ${position.entryPrice.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  ${position.currentPrice.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {position.size.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      position.pnl > 0
                        ? 'success.main'
                        : position.pnl < 0
                        ? 'error.main'
                        : 'inherit',
                  }}
                >
                  {position.pnl > 0 ? '+' : ''}$
                  {position.pnl.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      position.pnlPercentage > 0
                        ? 'success.main'
                        : position.pnlPercentage < 0
                        ? 'error.main'
                        : 'inherit',
                  }}
                >
                  {position.pnlPercentage > 0 ? '+' : ''}
                  {position.pnlPercentage.toFixed(2)}%
                </TableCell>
                <TableCell>
                  {new Date(position.openTime).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {positions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No open positions
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OpenPositions; 