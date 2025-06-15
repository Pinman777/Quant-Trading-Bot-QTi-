import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import BacktestSettings from '../../../components/BacktestSettings';
import BacktestResults from '../../../components/BacktestResults';

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
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `backtest-tab-${index}`,
    'aria-controls': `backtest-tabpanel-${index}`
  };
}

const BacktestPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunBacktest = async (settings: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${id}/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to run backtest');
      }

      const data = await response.json();
      setResults(data);
      setTabValue(1); // Switch to results tab
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Bot ID not provided</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <ArrowBackIcon
          sx={{ cursor: 'pointer', mr: 2 }}
          onClick={() => router.back()}
        />
        <Typography variant="h4">Backtest</Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="backtest tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Settings" {...a11yProps(0)} />
          <Tab label="Results" {...a11yProps(1)} disabled={!results} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <BacktestSettings
            botId={id as string}
            onRun={handleRunBacktest}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : results ? (
            <BacktestResults results={results} />
          ) : null}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default BacktestPage; 