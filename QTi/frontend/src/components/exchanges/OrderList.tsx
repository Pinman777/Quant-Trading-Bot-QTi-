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
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { exchangeService } from '../../services/exchange';
import {
  ExchangeType,
  Order,
  MarketType
} from '../../types/exchange';

interface OrderListProps {
  exchange: ExchangeType;
  symbol?: string;
  marketType?: MarketType;
}

export const OrderList: React.FC<OrderListProps> = ({ exchange, symbol, marketType }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    marketType: 'spot' as MarketType,
    side: 'buy' as 'buy' | 'sell',
    type: 'limit' as 'limit' | 'market' | 'stop' | 'stop_limit',
    quantity: '',
    price: '',
    stopPrice: ''
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await exchangeService.getOpenOrders(exchange, symbol, marketType);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, [exchange, symbol, marketType]);

  const handleCreateOrder = async () => {
    try {
      const order = await exchangeService.createOrder(exchange, {
        symbol: formData.symbol,
        marketType: formData.marketType,
        side: formData.side,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        price: formData.price ? parseFloat(formData.price) : undefined,
        stopPrice: formData.stopPrice ? parseFloat(formData.stopPrice) : undefined
      });

      setOrders([...orders, order]);
      setOpenDialog(false);
      setFormData({
        symbol: '',
        marketType: 'spot',
        side: 'buy',
        type: 'limit',
        quantity: '',
        price: '',
        stopPrice: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await exchangeService.cancelOrder(exchange, symbol || '', marketType || 'spot', orderId);
      setOrders(orders.filter(order => order.orderId !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    }
  };

  if (loading && orders.length === 0) {
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
        <Typography variant="h5">Orders</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mr: 1 }}
          >
            New Order
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={loadOrders}>
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
                  <TableCell>Symbol</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Filled</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.symbol}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.type}
                        color={order.type === 'market' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.side}
                        color={order.side === 'buy' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.filledQuantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'filled'
                            ? 'success'
                            : order.status === 'canceled'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Cancel Order">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={order.status !== 'new' && order.status !== 'partially_filled'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Market Type</InputLabel>
              <Select
                value={formData.marketType}
                onChange={(e) => setFormData({ ...formData, marketType: e.target.value as MarketType })}
              >
                <MenuItem value="spot">Spot</MenuItem>
                <MenuItem value="futures">Futures</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Side</InputLabel>
              <Select
                value={formData.side}
                onChange={(e) => setFormData({ ...formData, side: e.target.value as 'buy' | 'sell' })}
              >
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'limit' | 'market' | 'stop' | 'stop_limit' })}
              >
                <MenuItem value="limit">Limit</MenuItem>
                <MenuItem value="market">Market</MenuItem>
                <MenuItem value="stop">Stop</MenuItem>
                <MenuItem value="stop_limit">Stop Limit</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              fullWidth
            />

            {formData.type !== 'market' && (
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                fullWidth
              />
            )}

            {(formData.type === 'stop' || formData.type === 'stop_limit') && (
              <TextField
                label="Stop Price"
                type="number"
                value={formData.stopPrice}
                onChange={(e) => setFormData({ ...formData, stopPrice: e.target.value })}
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained" color="primary">
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 