import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import BotStats from '../components/bots/BotStats';

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
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `stats-tab-${index}`,
    'aria-controls': `stats-tabpanel-${index}`,
  };
}

const StatsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [selectedBot, setSelectedBot] = useState('all');

  // Mock data
  const bots = [
    { id: '1', name: 'BTC/USDT Grid Bot' },
    { id: '2', name: 'ETH/USDT DCA Bot' },
    { id: '3', name: 'SOL/USDT RSI Bot' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (event: any) => {
    setSelectedTimeframe(event.target.value);
  };

  const handleBotChange = (event: any) => {
    setSelectedBot(event.target.value);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implement refresh logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to refresh data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      // Implement export logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Performance Statistics</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={selectedTimeframe}
                label="Timeframe"
                onChange={handleTimeframeChange}
              >
                <MenuItem value="1h">1 Hour</MenuItem>
                <MenuItem value="1d">1 Day</MenuItem>
                <MenuItem value="1w">1 Week</MenuItem>
                <MenuItem value="1m">1 Month</MenuItem>
                <MenuItem value="1y">1 Year</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Bot</InputLabel>
              <Select value={selectedBot} label="Bot" onChange={handleBotChange}>
                <MenuItem value="all">All Bots</MenuItem>
                {bots.map((bot) => (
                  <MenuItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
            >
              Export
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="stats tabs">
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Individual Bots" {...a11yProps(1)} />
            <Tab label="Comparison" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Overall Performance
                </Typography>
                <BotStats
                  botId="all"
                  onRefresh={handleRefresh}
                  loading={loading}
                  error={error}
                />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {bots.map((bot) => (
              <Grid item xs={12} key={bot.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {bot.name}
                  </Typography>
                  <BotStats
                    botId={bot.id}
                    onRefresh={handleRefresh}
                    loading={loading}
                    error={error}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Bot Comparison
                </Typography>
                {/* TODO: Implement comparison chart */}
                <Typography variant="body1" color="text.secondary">
                  Comparison chart will be implemented here
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default StatsPage; 