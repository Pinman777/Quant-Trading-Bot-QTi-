import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Link as MuiLink,
  Breadcrumbs
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import BotSettings from '../../../components/BotSettings';
import NotificationSettings from '../../../components/NotificationSettings';
import ExchangeApiKeys from '../../../components/ExchangeApiKeys';
import SecuritySettings from '../../../components/SecuritySettings';
import BacktestSettings from '../../../components/BacktestSettings';
import SignalNotifications from '../../../components/SignalNotifications';
import Link from 'next/link';
import SignalSettings from '../../../components/SignalSettings';
import StrategySettings from '../../../components/StrategySettings';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`
  };
}

const BotSettingsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(false);
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Bot ID not provided</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" passHref>
          <MuiLink underline="hover" color="inherit">
            Home
          </MuiLink>
        </Link>
        <Link href={`/bot/${id}`} passHref>
          <MuiLink underline="hover" color="inherit">
            Bot
          </MuiLink>
        </Link>
        <Typography color="text.primary">Settings</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Link href={`/bot/${id}`} passHref>
          <Box
            component="a"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} />
            Back to Bot
          </Box>
        </Link>
        <Typography variant="h4" sx={{ ml: 2 }}>Bot Settings</Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Strategy" {...a11yProps(0)} />
          <Tab label="Notifications" {...a11yProps(1)} />
          <Tab label="Signal Alerts" {...a11yProps(2)} />
          <Tab label="API Keys" {...a11yProps(3)} />
          <Tab label="Security" {...a11yProps(4)} />
          <Tab label="Backtesting" {...a11yProps(5)} />
          <Tab label="Signals" {...a11yProps(6)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <StrategySettings botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NotificationSettings botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SignalNotifications botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ExchangeApiKeys botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <SecuritySettings botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <BacktestSettings botId={id as string} />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <SignalSettings botId={id as string} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default BotSettingsPage; 