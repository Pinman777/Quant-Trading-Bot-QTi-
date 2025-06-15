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
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { exchangeService } from '../../services/exchange';
import {
  ExchangeType,
  Balance
} from '../../types/exchange';

interface BalanceListProps {
  exchange: ExchangeType;
  asset?: string;
}

export const BalanceList: React.FC<BalanceListProps> = ({ exchange, asset }) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBalances = async () => {
    try {
      setLoading(true);
      const data = await exchangeService.getBalance(exchange, asset);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
    const interval = setInterval(loadBalances, 5000); // Обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, [exchange, asset]);

  const filteredBalances = balances.filter(balance =>
    balance.asset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && balances.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Balances</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder="Search asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={loadBalances}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Asset</TableCell>
                  <TableCell align="right">Free</TableCell>
                  <TableCell align="right">Locked</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBalances.map((balance) => (
                  <TableRow key={balance.asset}>
                    <TableCell>{balance.asset}</TableCell>
                    <TableCell align="right">{balance.free.toFixed(8)}</TableCell>
                    <TableCell align="right">{balance.locked.toFixed(8)}</TableCell>
                    <TableCell align="right">{balance.total.toFixed(8)}</TableCell>
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