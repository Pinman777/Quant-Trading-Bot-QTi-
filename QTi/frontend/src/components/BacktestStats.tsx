import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Timeline as TimelineIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';

interface BacktestStatsProps {
    history: Array<{
        total_profit: number;
        win_rate: number;
        total_trades: number;
        max_drawdown: number;
    }>;
}

export const BacktestStats: React.FC<BacktestStatsProps> = ({ history }) => {
    const stats = React.useMemo(() => {
        if (!history.length) {
            return {
                avgProfit: 0,
                bestProfit: 0,
                worstProfit: 0,
                avgWinRate: 0,
                totalTrades: 0,
                avgDrawdown: 0,
                maxDrawdown: 0,
            };
        }

        const profits = history.map(h => h.total_profit);
        const winRates = history.map(h => h.win_rate);
        const drawdowns = history.map(h => h.max_drawdown);
        const totalTrades = history.reduce((sum, h) => sum + h.total_trades, 0);

        return {
            avgProfit: profits.reduce((a, b) => a + b, 0) / profits.length,
            bestProfit: Math.max(...profits),
            worstProfit: Math.min(...profits),
            avgWinRate: winRates.reduce((a, b) => a + b, 0) / winRates.length,
            totalTrades,
            avgDrawdown: drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length,
            maxDrawdown: Math.max(...drawdowns),
        };
    }, [history]);

    const StatCard = ({ title, value, icon, color }: {
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color?: string;
    }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                    <Box color={color} mr={1}>
                        {icon}
                    </Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" component="div" color={color}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                    {typeof value === 'number' && title.includes('Profit') && '%'}
                    {typeof value === 'number' && title.includes('Rate') && '%'}
                    {typeof value === 'number' && title.includes('Drawdown') && '%'}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Average Profit"
                    value={stats.avgProfit}
                    icon={<TrendingUpIcon />}
                    color={stats.avgProfit >= 0 ? 'success.main' : 'error.main'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Best/Worst Profit"
                    value={`${stats.bestProfit.toFixed(2)}% / ${stats.worstProfit.toFixed(2)}%`}
                    icon={<TrendingDownIcon />}
                    color={stats.bestProfit >= 0 ? 'success.main' : 'error.main'}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Average Win Rate"
                    value={stats.avgWinRate}
                    icon={<TimelineIcon />}
                    color="primary.main"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Max Drawdown"
                    value={stats.maxDrawdown}
                    icon={<AssessmentIcon />}
                    color="error.main"
                />
            </Grid>
        </Grid>
    ); 