import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Grid,
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface BacktestResult {
    id: string;
    symbol: string;
    timeframe: string;
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    maxDrawdown: number;
    equityCurve: Array<{
        timestamp: string;
        equity: number;
    }>;
}

interface BacktestComparisonProps {
    results: BacktestResult[];
}

const BacktestComparison: React.FC<BacktestComparisonProps> = ({ results }) => {
    const [selectedResults, setSelectedResults] = useState<string[]>([]);

    const handleResultSelect = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        setSelectedResults(typeof value === 'string' ? value.split(',') : value);
    };

    const getChartData = () => {
        const colors = [
            '#00C4B4', // Green
            '#FF5252', // Red
            '#FFB74D', // Orange
            '#64B5F6', // Blue
            '#BA68C8', // Purple
        ];

        const datasets = selectedResults
            .map((resultId, index) => {
                const result = results.find(r => r.id === resultId);
                if (!result) return undefined;
                return {
                    label: `${result.symbol} (${result.timeframe})`,
                    data: result.equityCurve.map(point => ({
                        x: new Date(point.timestamp),
                        y: point.equity,
                    })),
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length],
                    tension: 0.1,
                };
            })
            .filter((d): d is Exclude<typeof d, undefined> => d !== undefined);

        return {
            datasets,
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Equity Curve Comparison',
            },
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'day' as const,
                },
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Equity',
                },
            },
        },
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Compare Results</Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Select Results to Compare (max 3)</InputLabel>
                            <Select
                                multiple
                                value={selectedResults}
                                onChange={handleResultSelect}
                                label="Select Results to Compare (max 3)"
                            >
                                {results.map((result) => (
                                    <MenuItem
                                        key={result.id}
                                        value={result.id}
                                        disabled={selectedResults.length >= 3 && !selectedResults.includes(result.id)}
                                    >
                                        {result.symbol} ({result.timeframe}) - {result.totalProfit.toFixed(2)}%
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Box height={400}>
                            <Line data={getChartData()} options={chartOptions} />
                        </Box>
                    </Grid>

                    {selectedResults.map((resultId) => {
                        const result = results.find(r => r.id === resultId);
                        if (!result) return null;

                        return (
                            <Grid item xs={12} md={4} key={resultId}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {result.symbol} ({result.timeframe})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Profit: {result.totalProfit.toFixed(2)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Win Rate: {result.winRate.toFixed(2)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Trades: {result.totalTrades}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Max Drawdown: {result.maxDrawdown.toFixed(2)}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BacktestComparison; 