import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: string;
  profit?: number;
}

interface RecentTradesProps {
  trades: Trade[];
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {trades.map((trade) => (
        <StyledListItem key={trade.id} alignItems="flex-start">
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" component="span">
                  {trade.symbol}
                </Typography>
                <Chip
                  label={trade.type.toUpperCase()}
                  color={trade.type === 'buy' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            }
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{ display: 'block' }}
                >
                  Цена: {formatPrice(trade.price)} | Объем: {formatAmount(trade.amount)}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  {formatTime(trade.timestamp)}
                </Typography>
                {trade.profit !== undefined && (
                  <Typography
                    component="span"
                    variant="body2"
                    color={trade.profit >= 0 ? 'success.main' : 'error.main'}
                    sx={{ display: 'block' }}
                  >
                    Прибыль: {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                  </Typography>
                )}
              </React.Fragment>
            }
          />
        </StyledListItem>
      ))}
    </List>
  );
};

export default RecentTrades; 