import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Tabs,
    Tab,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Slider,
} from '@mui/material';
import {
    Save as SaveIcon,
    Restore as RestoreIcon,
} from '@mui/icons-material';

interface BacktestResult {
    id: string;
    symbol: string;
    timeframe: string;
    total_profit: number;
    win_rate: number;
    total_trades: number;
    max_drawdown: number;
    created_at: string;
}

interface BacktestGroupingProps {
    results: BacktestResult[];
    onGroupSelect: (group: string, value: string) => void;
    onFilterChange: (filters: FilterSettings) => void;
}

interface FilterSettings {
    profitRange: [number, number];
    drawdownRange: [number, number];
    winRateRange: [number, number];
    tradesRange: [number, number];
}

const BacktestGrouping: React.FC<BacktestGroupingProps> = ({
    results,
    onGroupSelect,
    onFilterChange,
}) => {
    const [groupBy, setGroupBy] = useState<'symbol' | 'timeframe'>('symbol');
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [filters, setFilters] = useState<FilterSettings>({
        profitRange: [-100, 100] as [number, number],
        drawdownRange: [0, 100] as [number, number],
        winRateRange: [0, 100] as [number, number],
        tradesRange: [0, 1000] as [number, number],
    });

    // Загрузка сохраненных настроек при монтировании
    useEffect(() => {
        const savedFilters = localStorage.getItem('backtestFilters');
        if (savedFilters) {
            setFilters(JSON.parse(savedFilters));
        }
    }, []);

    // Сохранение настроек при изменении
    useEffect(() => {
        localStorage.setItem('backtestFilters', JSON.stringify(filters));
        onFilterChange(filters);
    }, [filters]);

    const groups = React.useMemo(() => {
        const grouped = results.reduce((acc, result) => {
            const key = result[groupBy];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(result);
            return acc;
        }, {} as Record<string, BacktestResult[]>);

        return Object.entries(grouped).map(([key, items]) => ({
            key,
            count: items.length,
            avgProfit: items.reduce((sum, item) => sum + item.total_profit, 0) / items.length,
            avgWinRate: items.reduce((sum, item) => sum + item.win_rate, 0) / items.length,
        }));
    }, [results, groupBy]);

    const handleGroupClick = (group: string) => {
        setSelectedGroup(group === selectedGroup ? '' : group);
        onGroupSelect(groupBy, group);
    };

    const handleFilterChange = (key: keyof FilterSettings, value: [number, number]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Group Results</Typography>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Save Filter Settings">
                            <IconButton
                                onClick={() => localStorage.setItem('backtestFilters', JSON.stringify(filters))}
                                size="small"
                            >
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Restore Default Settings">
                            <IconButton
                                onClick={() => {
                                    const defaultFilters: FilterSettings = {
                                        profitRange: [-100, 100] as [number, number],
                                        drawdownRange: [0, 100] as [number, number],
                                        winRateRange: [0, 100] as [number, number],
                                        tradesRange: [0, 1000] as [number, number],
                                    };
                                    setFilters(defaultFilters);
                                }}
                                size="small"
                            >
                                <RestoreIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Tabs
                    value={groupBy}
                    onChange={(_, value) => setGroupBy(value)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Group by Symbol" value="symbol" />
                    <Tab label="Group by Timeframe" value="timeframe" />
                </Tabs>

                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {groups.map(({ key, count, avgProfit, avgWinRate }) => (
                            <Chip
                                key={key}
                                label={`${key} (${count}) - ${avgProfit.toFixed(2)}% / ${avgWinRate.toFixed(2)}%`}
                                onClick={() => handleGroupClick(key)}
                                color={selectedGroup === key ? 'primary' : 'default'}
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Filter Settings
                    </Typography>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="body2">Profit Range (%)</Typography>
                            <Slider
                                value={filters.profitRange}
                                onChange={(_, value) => handleFilterChange('profitRange', value as [number, number])}
                                valueLabelDisplay="auto"
                                min={-100}
                                max={100}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2">Drawdown Range (%)</Typography>
                            <Slider
                                value={filters.drawdownRange}
                                onChange={(_, value) => handleFilterChange('drawdownRange', value as [number, number])}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2">Win Rate Range (%)</Typography>
                            <Slider
                                value={filters.winRateRange}
                                onChange={(_, value) => handleFilterChange('winRateRange', value as [number, number])}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100}
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2">Trades Range</Typography>
                            <Slider
                                value={filters.tradesRange}
                                onChange={(_, value) => handleFilterChange('tradesRange', value as [number, number])}
                                valueLabelDisplay="auto"
                                min={0}
                                max={1000}
                            />
                        </Box>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BacktestGrouping; 