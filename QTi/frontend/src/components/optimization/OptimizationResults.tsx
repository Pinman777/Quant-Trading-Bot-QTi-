import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PerformanceChart from '../bots/PerformanceChart';

interface OptimizationResult {
  id: string;
  strategy: string;
  exchange: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  parameters: {
    name: string;
    value: number | string | boolean;
  }[];
  metrics: {
    profitLoss: number;
    trades: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  chartData: {
    time: string;
    value: number;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`optimization-tabpanel-${index}`}
      aria-labelledby={`optimization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

interface OptimizationResultsProps {
  results: OptimizationResult[];
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedResults = [...results].sort(
    (a, b) => b.metrics.profitLoss - a.metrics.profitLoss
  );

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Optimization Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {results[0]?.strategy} • {results[0]?.exchange} •{' '}
            {results[0]?.symbol} • {results[0]?.timeframe}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Period: {new Date(results[0]?.startDate).toLocaleDateString()} -{' '}
            {new Date(results[0]?.endDate).toLocaleDateString()}
          </Typography>
        </Grid>

        {/* Best Result Metrics */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Best Result
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      Profit/Loss
                    </Typography>
                    <Typography
                      variant="h6"
                      color={
                        results[0]?.metrics.profitLoss > 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {results[0]?.metrics.profitLoss > 0 ? '+' : ''}
                      {results[0]?.metrics.profitLoss.toFixed(2)}%
                    </Typography>
                  </MetricCard>
                </Grid>
                <Grid item xs={6}>
                  <MetricCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      Trades
                    </Typography>
                    <Typography variant="h6">
                      {results[0]?.metrics.trades}
                    </Typography>
                  </MetricCard>
                </Grid>
                <Grid item xs={6}>
                  <MetricCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      Win Rate
                    </Typography>
                    <Typography variant="h6">
                      {results[0]?.metrics.winRate.toFixed(2)}%
                    </Typography>
                  </MetricCard>
                </Grid>
                <Grid item xs={6}>
                  <MetricCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      Max Drawdown
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {results[0]?.metrics.maxDrawdown.toFixed(2)}%
                    </Typography>
                  </MetricCard>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <PerformanceChart
                  data={results[0]?.chartData || []}
                  height={300}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Results Table */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Results" />
              <Tab label="Parameters" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Profit/Loss</TableCell>
                    <TableCell>Trades</TableCell>
                    <TableCell>Win Rate</TableCell>
                    <TableCell>Max Drawdown</TableCell>
                    <TableCell>Sharpe Ratio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedResults
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((result, index) => (
                      <TableRow key={result.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell
                          sx={{
                            color:
                              result.metrics.profitLoss > 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {result.metrics.profitLoss > 0 ? '+' : ''}
                          {result.metrics.profitLoss.toFixed(2)}%
                        </TableCell>
                        <TableCell>{result.metrics.trades}</TableCell>
                        <TableCell>
                          {result.metrics.winRate.toFixed(2)}%
                        </TableCell>
                        <TableCell sx={{ color: 'error.main' }}>
                          {result.metrics.maxDrawdown.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          {result.metrics.sharpeRatio.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={results.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results[0]?.parameters.map((param) => (
                    <TableRow key={param.name}>
                      <TableCell>{param.name}</TableCell>
                      <TableCell>
                        {typeof param.value === 'boolean' ? (
                          <Chip
                            label={param.value ? 'Yes' : 'No'}
                            color={param.value ? 'success' : 'default'}
                            size="small"
                          />
                        ) : (
                          param.value.toString()
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OptimizationResults; 