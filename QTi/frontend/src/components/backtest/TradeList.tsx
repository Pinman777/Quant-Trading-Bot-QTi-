import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
} from '@mui/material';

interface Trade {
  id: string;
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  profit?: number;
  profitPercentage?: number;
}

interface TradeListProps {
  trades: Trade[];
}

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Trade History
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {new Date(trade.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.type.toUpperCase()}
                      color={trade.type === 'buy' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${trade.price.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {trade.amount.toFixed(8)}
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
                          : 'error.main',
                    }}
                  >
                    {trade.profit && (
                      <>
                        ${trade.profit.toLocaleString()}
                        {trade.profitPercentage && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            ({trade.profitPercentage.toFixed(2)}%)
                          </Typography>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={trades.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default TradeList; 