import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { BotDetails } from '../../components/BotDetails';
import { TradingChart } from '../../components/TradingChart';
import { ChartIndicators } from '../../components/ChartIndicators';
import { TradingAnalytics } from '../../components/TradingAnalytics';
import { BotLogs } from '../../components/BotLogs';
import { BotStatus, BotTrade } from '../../types/bot';
import { useWebSocket } from '../../hooks/useWebSocket';

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
      id={`bot-tabpanel-${index}`}
      aria-labelledby={`bot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Indicator {
  name: string;
  type: string;
  params: { [key: string]: number };
  color: string;
}

const BotDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [bot, setBot] = useState<BotStatus | null>(null);
  const [trades, setTrades] = useState<BotTrade[]>([]);
  const [candles, setCandles] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedBot, setEditedBot] = useState<Partial<BotStatus>>({});
  const [tabValue, setTabValue] = useState(0);

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (id) {
      fetchBotData();
    }
  }, [id]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'bot_update' && lastMessage.data.id === id) {
      setBot(lastMessage.data);
    }
  }, [lastMessage, id]);

  const fetchBotData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [botResponse, tradesResponse, candlesResponse] = await Promise.all([
        fetch(`/api/bots/${id}`),
        fetch(`/api/bots/${id}/trades`),
        fetch(`/api/bots/${id}/candles`)
      ]);

      if (!botResponse.ok || !tradesResponse.ok || !candlesResponse.ok) {
        throw new Error('Failed to fetch bot data');
      }

      const [botData, tradesData, candlesData] = await Promise.all([
        botResponse.json(),
        tradesResponse.json(),
        candlesResponse.json()
      ]);

      setBot(botData);
      setTrades(tradesData);
      setCandles(candlesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (botId: string) => {
    try {
      const response = await fetch(`/api/bots/${botId}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start bot');
      }

      await fetchBotData();
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  };

  const handleStop = async (botId: string) => {
    try {
      const response = await fetch(`/api/bots/${botId}/stop`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to stop bot');
      }

      await fetchBotData();
    } catch (error) {
      console.error('Error stopping bot:', error);
      throw error;
    }
  };

  const handleRefresh = async (botId: string) => {
    try {
      const response = await fetch(`/api/bots/${botId}/refresh`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to refresh bot');
      }

      await fetchBotData();
    } catch (error) {
      console.error('Error refreshing bot:', error);
      throw error;
    }
  };

  const handleEdit = (botId: string) => {
    if (bot) {
      setEditedBot(bot);
      setEditDialogOpen(true);
    }
  };

  const handleEditSave = async () => {
    if (!bot) return;

    try {
      const response = await fetch(`/api/bots/${bot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedBot)
      });

      if (!response.ok) {
        throw new Error('Failed to update bot');
      }

      await fetchBotData();
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bot');
    }
  };

  const handleAddIndicator = (indicator: Indicator) => {
    setIndicators(prev => [...prev, indicator]);
  };

  const handleRemoveIndicator = (name: string) => {
    setIndicators(prev => prev.filter(i => i.name !== name));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (error || !bot) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography color="error" variant="h6">
            {error || 'Bot not found'}
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/bots')}
            sx={{ mt: 2 }}
          >
            Back to Bots
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/bots')}
            sx={{ mr: 2 }}
          >
            Back to Bots
          </Button>
          <Typography variant="h4">Bot Details</Typography>
        </Box>

        <BotDetails
          bot={bot}
          onStart={handleStart}
          onStop={handleStop}
          onRefresh={handleRefresh}
          onEdit={handleEdit}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Chart" />
            <Tab label="Analytics" />
            <Tab label="Logs" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={9}>
              <TradingChart
                symbol={bot?.symbol || ''}
                timeframe={bot?.config?.timeframe || ''}
                trades={trades}
                candles={candles}
                indicators={indicators.map(indicator => ({
                  name: indicator.name,
                  data: [], // TODO: Calculate indicator data
                  color: indicator.color
                }))}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <ChartIndicators
                onAddIndicator={handleAddIndicator}
                onRemoveIndicator={handleRemoveIndicator}
                indicators={indicators}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TradingAnalytics trades={trades} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <BotLogs botId={id as string} />
        </TabPanel>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Bot</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={editedBot.name || ''}
              onChange={(e) => setEditedBot({ ...editedBot, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Exchange"
              value={editedBot.exchange || ''}
              onChange={(e) => setEditedBot({ ...editedBot, exchange: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Symbol"
              value={editedBot.symbol || ''}
              onChange={(e) => setEditedBot({ ...editedBot, symbol: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Strategy"
              value={editedBot.config?.strategy || ''}
              onChange={(e) =>
                setEditedBot({
                  ...editedBot,
                  config: { ...editedBot.config, strategy: e.target.value }
                })
              }
              margin="normal"
            >
              <MenuItem value="ma_crossover">MA Crossover</MenuItem>
              <MenuItem value="rsi">RSI</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Timeframe"
              value={editedBot.config?.timeframe || ''}
              onChange={(e) =>
                setEditedBot({
                  ...editedBot,
                  config: { ...editedBot.config, timeframe: e.target.value }
                })
              }
              margin="normal"
            >
              <MenuItem value="1m">1 minute</MenuItem>
              <MenuItem value="5m">5 minutes</MenuItem>
              <MenuItem value="15m">15 minutes</MenuItem>
              <MenuItem value="1h">1 hour</MenuItem>
              <MenuItem value="4h">4 hours</MenuItem>
              <MenuItem value="1d">1 day</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BotDetailsPage; 