import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

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

interface BacktestExportProps {
    results: BacktestResult[];
}

const BacktestExport: React.FC<BacktestExportProps> = ({ results }) => {
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

    const handleFormatChange = (event: SelectChangeEvent) => {
        setExportFormat(event.target.value as 'csv' | 'json');
    };

    const handleExport = () => {
        if (exportFormat === 'csv') {
            exportToCSV();
        } else {
            exportToJSON();
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Symbol', 'Timeframe', 'Total Profit', 'Win Rate', 'Total Trades', 'Max Drawdown', 'Created At'];
        const csvContent = [
            headers.join(','),
            ...results.map(result => [
                result.id,
                result.symbol,
                result.timeframe,
                result.total_profit,
                result.win_rate,
                result.total_trades,
                result.max_drawdown,
                new Date(result.created_at).toLocaleString(),
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `backtest_results_${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(results, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `backtest_results_${new Date().toISOString()}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Export Results</Typography>
                </Box>

                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel>Export Format</InputLabel>
                        <Select
                            value={exportFormat}
                            label="Export Format"
                            onChange={handleFormatChange}
                        >
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="json">JSON</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        fullWidth
                    >
                        Export Results
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default BacktestExport; 