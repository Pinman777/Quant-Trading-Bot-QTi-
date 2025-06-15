import React from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { Layout } from '../components/Layout';
import MarketData from '../components/MarketData';

const MarketPage: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Market Data
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Real-time cryptocurrency market data from CoinMarketCap. Data is updated every 5 minutes.
          </Typography>
        </Paper>
        <MarketData />
      </Container>
    </Layout>
  );
};

export default MarketPage; 