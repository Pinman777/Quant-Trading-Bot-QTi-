import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider
} from '@mui/material';
import { LineChart } from '@mui/x-charts';

interface OptimizationResult {
    id: string;
    bot_id: string;
    name: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    created_at: string;
    completed_at?: string;
    parameters: Record<string, number>;
    metrics: {
        sharpe_ratio: number;
        sortino_ratio: number;
        total_profit: number;
        win_rate: number;
        max_drawdown: number;
        profit_factor: number;
        avg_trade: number;
        avg_win: number;
        avg_loss: number;
        total_trades: number;
        winning_trades: number;
        losing_trades: number;
    };
    history: Array<{
        generation: number;
        best_fitness: number;
        avg_fitness: number;
        std_fitness: number;
    }>;
}

interface OptimizationResultsProps {
    result: OptimizationResult;
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({ result }) => {
    const formatNumber = (value: number) => value.toFixed(4);
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
    const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

    const xAxis = result.history.map(h => h.generation);
    const bestFitnessData = result.history.map(h => h.best_fitness);
    const avgFitnessData = result.history.map(h => h.avg_fitness);

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Optimization Results: {result.name}
            </Typography>

            <Grid container spacing={3}>
                {/* Параметры */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Best Parameters
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Parameter</TableCell>
                                            <TableCell>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(result.parameters).map(([param, value]) => (
                                            <TableRow key={param}>
                                                <TableCell>{param}</TableCell>
                                                <TableCell>{formatNumber(value)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Метрики производительности */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Performance Metrics
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Sharpe Ratio</TableCell>
                                            <TableCell>{formatNumber(result.metrics.sharpe_ratio)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sortino Ratio</TableCell>
                                            <TableCell>{formatNumber(result.metrics.sortino_ratio)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total Profit</TableCell>
                                            <TableCell>{formatCurrency(result.metrics.total_profit)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Win Rate</TableCell>
                                            <TableCell>{formatPercent(result.metrics.win_rate)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Max Drawdown</TableCell>
                                            <TableCell>{formatPercent(result.metrics.max_drawdown)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Profit Factor</TableCell>
                                            <TableCell>{formatNumber(result.metrics.profit_factor)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Статистика торговли */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trading Statistics
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Total Trades</TableCell>
                                            <TableCell>{result.metrics.total_trades}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Winning Trades</TableCell>
                                            <TableCell>{result.metrics.winning_trades}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Losing Trades</TableCell>
                                            <TableCell>{result.metrics.losing_trades}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Average Trade</TableCell>
                                            <TableCell>{formatCurrency(result.metrics.avg_trade)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Average Win</TableCell>
                                            <TableCell>{formatCurrency(result.metrics.avg_win)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Average Loss</TableCell>
                                            <TableCell>{formatCurrency(result.metrics.avg_loss)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* График прогресса оптимизации */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Optimization Progress
                            </Typography>
                            <Box height={400}>
                                <LineChart
                                    xAxis={[{ data: xAxis, scaleType: 'linear' }]}
                                    series={[
                                        {
                                            data: bestFitnessData,
                                            label: 'Best Fitness',
                                            color: '#8884d8'
                                        },
                                        {
                                            data: avgFitnessData,
                                            label: 'Average Fitness',
                                            color: '#82ca9d'
                                        }
                                    ]}
                                    margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OptimizationResults; 