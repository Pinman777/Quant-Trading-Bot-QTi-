import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { PerformanceHeatmap } from '../components/PerformanceHeatmap';
import { TradingStats } from '../components/TradingStats';
import { useWebSocket } from '../hooks/useWebSocket';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [tradingStats, setTradingStats] = useState<any>(null);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'analytics_update') {
      if (lastMessage.data.performance) {
        setPerformanceData(lastMessage.data.performance);
      }
      if (lastMessage.data.stats) {
        setTradingStats(lastMessage.data.stats);
      }
    }
  }, [lastMessage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [performanceResponse, statsResponse] = await Promise.all([
        fetch('/api/analytics/performance'),
        fetch('/api/analytics/stats')
      ]);

      if (!performanceResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [performanceData, statsData] = await Promise.all([
        performanceResponse.json(),
        statsResponse.json()
      ]);

      setPerformanceData(performanceData);
      setTradingStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleHeatmapCellClick = (symbol: string, timeframe: string) => {
    // Navigate to bot details if available
    const bot = performanceData.find(
      (d) => d.symbol === symbol && d.timeframe === timeframe
    );
    if (bot?.botId) {
      router.push(`/bot/${bot.botId}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Trading Analytics
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Performance Heatmap" />
            <Tab label="Trading Statistics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <PerformanceHeatmap
            data={performanceData}
            onCellClick={handleHeatmapCellClick}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {tradingStats && (
            <TradingStats
              equityCurve={tradingStats.equityCurve}
              trades={tradingStats.trades}
              stats={tradingStats.stats}
            />
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AnalyticsPage; 