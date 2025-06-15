import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface Coin {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  profit: number;
}

interface TopCoinsTableProps {
  coins: Coin[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#f5f5f5',
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
}));

const TopCoinsTable: React.FC<TopCoinsTableProps> = ({ coins }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(volume);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>Монета</StyledTableCell>
            <StyledTableCell align="right">Цена</StyledTableCell>
            <StyledTableCell align="right">Изменение 24ч</StyledTableCell>
            <StyledTableCell align="right">Объем 24ч</StyledTableCell>
            <StyledTableCell align="right">Прибыль</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coins.map((coin) => (
            <TableRow key={coin.symbol}>
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {coin.symbol}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatPrice(coin.price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  color={coin.change24h >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatPercentage(coin.change24h)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatVolume(coin.volume24h)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  color={coin.profit >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatPercentage(coin.profit)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TopCoinsTable; 