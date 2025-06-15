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
    Paper
} from '@mui/material';

interface OptimizationMetrics {
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
}

interface OptimizationMetricsProps {
    metrics: OptimizationMetrics;
}

const OptimizationMetrics: React.FC<OptimizationMetricsProps> = ({ metrics }) => {
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
    const formatNumber = (value: number) => value.toFixed(2);

    const metricGroups = [
        {
            title: 'Performance Metrics',
            metrics: [
                { label: 'Total Profit', value: formatPercentage(metrics.total_profit) },
                { label: 'Sharpe Ratio', value: formatNumber(metrics.sharpe_ratio) },
                { label: 'Sortino Ratio', value: formatNumber(metrics.sortino_ratio) },
                { label: 'Max Drawdown', value: formatPercentage(metrics.max_drawdown) },
                { label: 'Profit Factor', value: formatNumber(metrics.profit_factor) }
            ]
        },
        {
            title: 'Trade Statistics',
            metrics: [
                { label: 'Total Trades', value: metrics.total_trades },
                { label: 'Winning Trades', value: metrics.winning_trades },
                { label: 'Losing Trades', value: metrics.losing_trades },
                { label: 'Win Rate', value: formatPercentage(metrics.win_rate) },
                { label: 'Average Trade', value: formatPercentage(metrics.avg_trade) },
                { label: 'Average Win', value: formatPercentage(metrics.avg_win) },
                { label: 'Average Loss', value: formatPercentage(metrics.avg_loss) }
            ]
        }
    ];

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Optimization Metrics
            </Typography>

            <Grid container spacing={3}>
                {metricGroups.map((group, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {group.title}
                                </Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Metric</TableCell>
                                                <TableCell align="right">Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {group.metrics.map((metric, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell component="th" scope="row">
                                                        {metric.label}
                                                    </TableCell>
                                                    <TableCell align="right">{metric.value}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default OptimizationMetrics; 