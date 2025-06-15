import React, { useState, useMemo } from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Grid,
    Tooltip,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    FileDownload as ExportIcon,
    Sort as SortIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface BacktestHistoryItem {
    id: string;
    symbol: string;
    timeframe: string;
    start_date: string;
    end_date: string;
    total_profit: number;
    created_at: string;
}

interface BacktestHistoryProps {
    history: BacktestHistoryItem[];
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

type SortField = 'symbol' | 'timeframe' | 'total_profit' | 'created_at';
type SortOrder = 'asc' | 'desc';

const BacktestHistory: React.FC<BacktestHistoryProps> = ({
    history,
    onView,
    onDelete,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [dateRange, setDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    const filteredAndSortedHistory = useMemo(() => {
        let filtered = [...history];

        // Фильтрация по поисковому запросу
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.symbol.toLowerCase().includes(term) ||
                    item.timeframe.toLowerCase().includes(term)
            );
        }

        // Фильтрация по дате
        if (dateRange.start) {
            filtered = filtered.filter(
                item => new Date(item.created_at) >= dateRange.start!
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(
                item => new Date(item.created_at) <= dateRange.end!
            );
        }

        // Сортировка
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'symbol':
                    comparison = a.symbol.localeCompare(b.symbol);
                    break;
                case 'timeframe':
                    comparison = a.timeframe.localeCompare(b.timeframe);
                    break;
                case 'total_profit':
                    comparison = a.total_profit - b.total_profit;
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [history, searchTerm, sortField, sortOrder, dateRange]);

    const handleExportCSV = () => {
        const headers = ['Symbol', 'Timeframe', 'Period', 'Profit', 'Created'];
        const csvData = filteredAndSortedHistory.map(item => [
            item.symbol,
            item.timeframe,
            `${format(new Date(item.start_date), 'yyyy-MM-dd')} - ${format(new Date(item.end_date), 'yyyy-MM-dd')}`,
            `${item.total_profit.toFixed(2)}%`,
            format(new Date(item.created_at), 'yyyy-MM-dd HH:mm'),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `backtest_history_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
        link.click();
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    return (
        <Card>
            <Box p={2}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="Start Date"
                                    value={dateRange.start}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    label="End Date"
                                    value={dateRange.end}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" justifyContent="flex-end">
                            <Tooltip title="Export to CSV">
                                <IconButton onClick={handleExportCSV}>
                                    <ExportIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell onClick={() => toggleSort('symbol')} style={{ cursor: 'pointer' }}>
                                Symbol {getSortIcon('symbol')}
                            </TableCell>
                            <TableCell onClick={() => toggleSort('timeframe')} style={{ cursor: 'pointer' }}>
                                Timeframe {getSortIcon('timeframe')}
                            </TableCell>
                            <TableCell>Period</TableCell>
                            <TableCell onClick={() => toggleSort('total_profit')} style={{ cursor: 'pointer' }}>
                                Profit {getSortIcon('total_profit')}
                            </TableCell>
                            <TableCell onClick={() => toggleSort('created_at')} style={{ cursor: 'pointer' }}>
                                Created {getSortIcon('created_at')}
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.symbol}</TableCell>
                                <TableCell>{item.timeframe}</TableCell>
                                <TableCell>
                                    {format(new Date(item.start_date), 'yyyy-MM-dd')} -{' '}
                                    {format(new Date(item.end_date), 'yyyy-MM-dd')}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: item.total_profit >= 0 ? 'success.main' : 'error.main',
                                    }}
                                >
                                    {item.total_profit.toFixed(2)}%
                                </TableCell>
                                <TableCell>
                                    {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => onView(item.id)}
                                        title="View Details"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(item.id)}
                                        title="Delete"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default BacktestHistory; 