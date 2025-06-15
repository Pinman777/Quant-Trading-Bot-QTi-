import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { exchangeService } from '../../services/exchange';
import {
  ExchangeType,
  MarketInfo as MarketInfoType,
  OrderBook,
  Trade,
  MarketType
} from '../../types/exchange';

interface MarketInfoProps {
  exchange: string;
  symbol: string;
  market_type: string;
}

export const MarketInfo: React.FC<MarketInfoProps> = ({
  exchange,
  symbol,
  market_type
}) => {
  const [marketInfo, setMarketInfo] = useState<MarketInfoType | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load market info
        const markets = await exchangeService.getMarkets(exchange, market_type);
        const market = markets.find(m => m.symbol === symbol);
        if (market) {
          setMarketInfo(market);
        }

        // Load order book
        const book = await exchangeService.getOrderBook(exchange, symbol, market_type);
        setOrderBook(book);

        // Load recent trades
        const recentTrades = await exchangeService.getTrades(exchange, symbol, market_type);
        setTrades(recentTrades);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [exchange, symbol, market_type]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {symbol} Market Information
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => {}}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {/* Market Info */}
        {marketInfo && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Symbol: {marketInfo.symbol}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Base Asset: {marketInfo.base_asset}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Quote Asset: {marketInfo.quote_asset}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Min Price: {marketInfo.min_price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Max Price: {marketInfo.max_price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Min Quantity: {marketInfo.min_qty}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Max Quantity: {marketInfo.max_qty}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Min Notional: {marketInfo.min_notional}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Order Book */}
        {orderBook && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Book
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderBook.asks.slice().reverse().map(([price, qty], index) => (
                        <TableRow key={`ask-${index}`}>
                          <TableCell style={{ color: 'red' }}>
                            {price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {qty.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {orderBook.bids.map(([price, qty], index) => (
                        <TableRow key={`bid-${index}`}>
                          <TableCell style={{ color: 'green' }}>
                            {price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {qty.toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Trades */}
        {trades.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Trades
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell>Side</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell
                            style={{
                              color: trade.side === 'buy' ? 'green' : 'red'
                            }}
                          >
                            {trade.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {trade.qty.toFixed(4)}
                          </TableCell>
                          <TableCell
                            style={{
                              color: trade.side === 'buy' ? 'green' : 'red'
                            }}
                          >
                            {trade.side.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}; 