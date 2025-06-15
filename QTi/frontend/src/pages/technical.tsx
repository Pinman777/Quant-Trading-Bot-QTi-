import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Chart from '../components/Chart';
import TechnicalIndicators from '../components/TechnicalIndicators';

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT'];

const TechnicalPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[0]);
  const [selectedIndicators, setSelectedIndicators] = useState<{ name: string; params: Record<string, number | string> }[]>([]);

  const handleIndicatorChange = (indicators: { name: string; params: Record<string, number | string> }[]) => {
    setSelectedIndicators(indicators);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Technical Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Symbol</InputLabel>
                <Select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  label="Symbol"
                >
                  {symbols.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  label="Timeframe"
                >
                  {timeframes.map((tf) => (
                    <MenuItem key={tf} value={tf}>
                      {tf}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <TechnicalIndicators onIndicatorChange={handleIndicatorChange} />
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
              <Chart
                symbol={selectedSymbol}
                timeframe={selectedTimeframe}
                indicators={selectedIndicators}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TechnicalPage; 