import React, { useEffect, useState, useRef } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Stop as StopIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { createChart, ColorType } from 'lightweight-charts';
import { botApi } from '../services/api';

interface BotStatus {
    id: string;
    name: string;
    symbol: string;
    status: 'running' | 'stopped' | 'error';
    pnl: number;
    position: {
        side: 'long' | 'short' | 'none';
        size: number;
        entry_price: number;
        current_price: number;
    };
    last_update: string;
}

interface Trade {
    id: string;
    bot_id: string;
    symbol: string;
    side: 'buy' | 'sell';
    price: number;
    size: number;
    timestamp: string;
    pnl: number;
}

const BotMonitor: React.FC = () => {
    const [bots, setBots] = useState<BotStatus[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [selectedBot, setSelectedBot] = useState<string | null>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Initial fetch
        fetchBots();
        fetchTrades();

        // Setup WebSocket connection
        setupWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const setupWebSocket = () => {
        const ws = new WebSocket('ws://localhost:8000/ws/bots');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'bot_update') {
                updateBotStatus(data.bot);
            } else if (data.type === 'trade') {
                addTrade(data.trade);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    };

    const fetchBots = async () => {
        try {
            const response = await botApi.getBots();
            setBots(response.data);
        } catch (error) {
            console.error('Failed to fetch bots:', error);
        }
    };

    const fetchTrades = async () => {
        try {
            const response = await botApi.getTrades();
            setTrades(response.data);
        } catch (error) {
            console.error('Failed to fetch trades:', error);
        }
    };

    const updateBotStatus = (updatedBot: BotStatus) => {
        setBots(prev => prev.map(bot => 
            bot.id === updatedBot.id ? updatedBot : bot
        ));
    };

    const addTrade = (trade: Trade) => {
        setTrades(prev => [trade, ...prev].slice(0, 100)); // Keep last 100 trades
    };

    const handleStartBot = async (botId: string) => {
        try {
            await botApi.startBot(botId);
            fetchBots();
        } catch (error) {
            console.error('Failed to start bot:', error);
        }
    };

    const handleStopBot = async (botId: string) => {
        try {
            await botApi.stopBot(botId);
            fetchBots();
        } catch (error) {
            console.error('Failed to stop bot:', error);
        }
    };

    const handleBotSelect = (botId: string) => {
        setSelectedBot(botId);
        // Initialize chart for selected bot
        if (chartContainerRef.current) {
            if (chartRef.current) {
                chartRef.current.remove();
            }

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: '#1A2B44' },
                    textColor: '#FFFFFF',
                },
                grid: {
                    vertLines: { color: '#2B3B4E' },
                    horzLines: { color: '#2B3B4E' },
                },
                width: chartContainerRef.current.clientWidth,
                height: 400,
            });

            // Add candlestick series
            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#00C4B4',
                downColor: '#FF5252',
                borderVisible: false,
                wickUpColor: '#00C4B4',
                wickDownColor: '#FF5252',
            });

            // Add volume series
            const volumeSeries = chart.addHistogramSeries({
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });

            chartRef.current = chart;

            // Fetch and set initial data
            botApi.getBotChartData(botId).then(response => {
                const { candles, volume } = response.data;
                candlestickSeries.setData(candles);
                volumeSeries.setData(volume);
            });

            // Handle window resize
            const handleResize = () => {
                if (chartContainerRef.current) {
                    chart.applyOptions({
                        width: chartContainerRef.current.clientWidth,
                    });
                }
            };

            window.addEventListener('resize', handleResize);
        }
    };

    return (
        <Grid container spacing={3}>
            {/* Bot Status Table */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Bot Status
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Symbol</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>P&L</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bots.map((bot) => (
                                        <TableRow
                                            key={bot.id}
                                            onClick={() => handleBotSelect(bot.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedBot === bot.id ? 'action.selected' : 'inherit',
                                            }}
                                        >
                                            <TableCell>{bot.name}</TableCell>
                                            <TableCell>{bot.symbol}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={bot.status}
                                                    color={
                                                        bot.status === 'running'
                                                            ? 'success'
                                                            : bot.status === 'error'
                                                            ? 'error'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color: bot.pnl >= 0 ? 'success.main' : 'error.main',
                                                }}
                                            >
                                                {bot.pnl.toFixed(2)}%
                                            </TableCell>
                                            <TableCell>
                                                {bot.position.side !== 'none' && (
                                                    <Chip
                                                        label={`${bot.position.side.toUpperCase()} ${bot.position.size}`}
                                                        color={bot.position.side === 'long' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={bot.status === 'running' ? 'Stop Bot' : 'Start Bot'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            bot.status === 'running'
                                                                ? handleStopBot(bot.id)
                                                                : handleStartBot(bot.id);
                                                        }}
                                                    >
                                                        {bot.status === 'running' ? <StopIcon /> : <StartIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* Chart */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Price Chart
                        </Typography>
                        <Box ref={chartContainerRef} height={400} />
                    </CardContent>
                </Card>
            </Grid>

            {/* Recent Trades */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Recent Trades</Typography>
                            <IconButton onClick={fetchTrades} size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Bot</TableCell>
                                        <TableCell>Symbol</TableCell>
                                        <TableCell>Side</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Size</TableCell>
                                        <TableCell align="right">P&L</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trades.map((trade) => (
                                        <TableRow key={trade.id}>
                                            <TableCell>
                                                {new Date(trade.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{trade.bot_id}</TableCell>
                                            <TableCell>{trade.symbol}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={trade.side.toUpperCase()}
                                                    color={trade.side === 'buy' ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {trade.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell align="right">
                                                {trade.size.toFixed(4)}
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color: trade.pnl >= 0 ? 'success.main' : 'error.main',
                                                }}
                                            >
                                                {trade.pnl.toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default BotMonitor; 