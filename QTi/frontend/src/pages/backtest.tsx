import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
} from '@mui/material';
import BacktestManager from '../components/backtest/BacktestManager';
import OptimizerManager from '../components/bots/OptimizerManager';
import BacktestResults from '../components/backtest/BacktestResults';
import Optimizer from '../components/backtest/Optimizer';
import { useWebSocket } from '../hooks/useWebSocket';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface BacktestResult {
    id: string;
    config: {
        exchange: string;
        symbol: string;
        timeframe: string;
        startDate: string;
        endDate: string;
        initialBalance: number;
        strategy: string;
        parameters: {
            [key: string]: any;
        };
    };
    performance: {
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        winRate: number;
        profitFactor: number;
        sharpeRatio: number;
        maxDrawdown: number;
        finalBalance: number;
        totalReturn: number;
        annualizedReturn: number;
    };
    trades: {
        timestamp: string;
        type: 'buy' | 'sell';
        price: number;
        size: number;
        pnl: number;
    }[];
    equity: {
        timestamp: string;
        value: number;
    }[];
    createdAt: string;
}

interface OptimizationConfig {
    id: string;
    name: string;
    strategy: string;
    parameters: {
        gridSize: { min: number; max: number; step: number };
        gridSpacing: { min: number; max: number; step: number };
        stopLoss: { min: number; max: number; step: number };
        takeProfit: { min: number; max: number; step: number };
    };
    metric: 'sharpe' | 'profit' | 'winrate';
    populationSize: number;
    generations: number;
    crossoverRate: number;
    mutationRate: number;
}

interface OptimizationResult {
    id: string;
    configId: string;
    status: 'completed' | 'running' | 'failed';
    startTime: string;
    endTime: string;
    bestParameters: {
        gridSize: number;
        gridSpacing: number;
        stopLoss: number;
        takeProfit: number;
    };
    bestMetric: number;
    population: {
        parameters: {
            gridSize: number;
            gridSpacing: number;
            stopLoss: number;
            takeProfit: number;
        };
        metrics: {
            sharpe: number;
            profit: number;
            winrate: number;
        };
    }[];
    history: {
        generation: number;
        bestMetric: number;
        averageMetric: number;
    }[];
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`backtest-tabpanel-${index}`}
            aria-labelledby={`backtest-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

function a11yProps(index: number) {
    return {
        id: `backtest-tab-${index}`,
        'aria-controls': `backtest-tabpanel-${index}`,
    };
}

const BacktestPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [configs, setConfigs] = useState<any[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<any>(null);
    const [backtestResults, setBacktestResults] = useState<any[]>([]);
    const [optimizationResults, setOptimizationResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { lastMessage } = useWebSocket('/ws/backtest');

    useEffect(() => {
        if (lastMessage) {
            const data = JSON.parse(lastMessage.data);
            if (data.type === 'backtest_update') {
                setBacktestResults((prev) =>
                    prev.map((result) =>
                        result.id === data.result.id ? { ...result, ...data.result } : result
                    )
                );
            } else if (data.type === 'optimization_update') {
                setOptimizationResults((prev) =>
                    prev.map((result) =>
                        result.id === data.result.id ? { ...result, ...data.result } : result
                    )
                );
            }
        }
    }, [lastMessage]);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/configs');
            if (!response.ok) {
                throw new Error('Failed to fetch configurations');
            }
            const data = await response.json();
            setConfigs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch configurations');
        } finally {
            setLoading(false);
        }
    };

    const fetchBacktestResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/backtest/results');
            if (!response.ok) {
                throw new Error('Failed to fetch backtest results');
            }
            const data = await response.json();
            setBacktestResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch backtest results');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptimizationResults = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/backtest/optimization/results');
            if (!response.ok) {
                throw new Error('Failed to fetch optimization results');
            }
            const data = await response.json();
            setOptimizationResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch optimization results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
        fetchBacktestResults();
        fetchOptimizationResults();
    }, []);

    const handleStartBacktest = async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/backtest/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                throw new Error('Failed to start backtest');
            }
            await fetchBacktestResults();
            setSuccess('Backtest started successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start backtest');
        } finally {
            setLoading(false);
        }
    };

    const handleStopBacktest = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/backtest/${id}/stop`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to stop backtest');
            }
            await fetchBacktestResults();
            setSuccess('Backtest stopped successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop backtest');
        } finally {
            setLoading(false);
        }
    };

    const handleStartOptimization = async (params: any) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/backtest/optimization/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                throw new Error('Failed to start optimization');
            }
            await fetchOptimizationResults();
            setSuccess('Optimization started successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start optimization');
        } finally {
            setLoading(false);
        }
    };

    const handleStopOptimization = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/backtest/optimization/stop', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to stop optimization');
            }
            await fetchOptimizationResults();
            setSuccess('Optimization stopped successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to stop optimization');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOptimizationResult = async (result: any) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/configs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...result.parameters,
                    name: `${result.parameters.name} (Optimized)`,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to save optimization result');
            }
            await fetchConfigs();
            setSuccess('Optimization result saved successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save optimization result');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOptimizationResult = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/backtest/optimization/results/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete optimization result');
            }
            await fetchOptimizationResults();
            setSuccess('Optimization result deleted successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete optimization result');
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicateOptimizationResult = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/backtest/optimization/results/${id}/duplicate`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to duplicate optimization result');
            }
            await fetchOptimizationResults();
            setSuccess('Optimization result duplicated successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to duplicate optimization result');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBacktestResult = async (id: string) => {
        try {
            const response = await fetch(`/api/backtest/results/${id}/download`);
            if (!response.ok) {
                throw new Error('Failed to download backtest result');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backtest-result-${id}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to download backtest result');
        }
    };

    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <Typography variant="h4" gutterBottom>
                    Backtesting & Optimization
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, newValue) => setActiveTab(newValue)}
                    >
                        <Tab label="Backtesting" />
                        <Tab label="Optimization" />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    {backtestResults.map((result) => (
                        <BacktestResults
                            key={result.id}
                            result={result}
                            loading={loading}
                            error={error || undefined}
                            onDownload={() => handleDownloadBacktestResult(result.id)}
                        />
                    ))}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {configs.map((config) => (
                        <Optimizer
                            key={config.id}
                            config={config}
                            onStart={handleStartOptimization}
                            onStop={handleStopOptimization}
                            onSave={handleSaveOptimizationResult}
                            onDelete={handleDeleteOptimizationResult}
                            onDuplicate={handleDuplicateOptimizationResult}
                            results={optimizationResults.filter((r) => r.configId === config.id)}
                            loading={loading}
                            error={error || undefined}
                        />
                    ))}
                </TabPanel>
            </Box>
        </Container>
    );
};

export default BacktestPage; 