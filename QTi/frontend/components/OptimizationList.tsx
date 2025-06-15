import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface Optimization {
    id: string;
    name: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    type: 'SHARPE' | 'SORTINO' | 'PROFIT' | 'WIN_RATE';
    created_at: string;
    completed_at?: string;
    best_fitness?: number;
    total_trades?: number;
    win_rate?: number;
}

type Order = 'asc' | 'desc';

interface OptimizationListProps {
    botId: string;
}

const OptimizationList: React.FC<OptimizationListProps> = ({ botId }) => {
    const navigate = useNavigate();
    const [optimizations, setOptimizations] = useState<Optimization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof Optimization>('created_at');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOptimizations();
    }, [botId]);

    const fetchOptimizations = async () => {
        try {
            const response = await fetch(`/api/optimize/${botId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch optimizations');
            }
            const data = await response.json();
            setOptimizations(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this optimization?')) {
            return;
        }

        try {
            const response = await fetch(`/api/optimize/${botId}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete optimization');
            }

            setOptimizations(optimizations.filter(opt => opt.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleSort = (property: keyof Optimization) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getStatusColor = (status: Optimization['status']) => {
        switch (status) {
            case 'COMPLETED':
                return 'success';
            case 'RUNNING':
                return 'primary';
            case 'FAILED':
                return 'error';
            default:
                return 'default';
        }
    };

    const filteredOptimizations = optimizations
        .filter(opt => 
            opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (aValue === undefined || bValue === undefined) {
                return 0;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return order === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return order === 'asc'
                ? Number(aValue) - Number(bValue)
                : Number(bValue) - Number(aValue);
        });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Optimizations
            </Typography>

            <Card>
                <CardContent>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by name or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'name'}
                                            direction={orderBy === 'name' ? order : 'asc'}
                                            onClick={() => handleSort('name')}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'type'}
                                            direction={orderBy === 'type' ? order : 'asc'}
                                            onClick={() => handleSort('type')}
                                        >
                                            Type
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'status'}
                                            direction={orderBy === 'status' ? order : 'asc'}
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'created_at'}
                                            direction={orderBy === 'created_at' ? order : 'asc'}
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Created
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'best_fitness'}
                                            direction={orderBy === 'best_fitness' ? order : 'asc'}
                                            onClick={() => handleSort('best_fitness')}
                                        >
                                            Best Fitness
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'total_trades'}
                                            direction={orderBy === 'total_trades' ? order : 'asc'}
                                            onClick={() => handleSort('total_trades')}
                                        >
                                            Total Trades
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'win_rate'}
                                            direction={orderBy === 'win_rate' ? order : 'asc'}
                                            onClick={() => handleSort('win_rate')}
                                        >
                                            Win Rate
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOptimizations.map((optimization) => (
                                    <TableRow key={optimization.id}>
                                        <TableCell>{optimization.name}</TableCell>
                                        <TableCell>{optimization.type}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={optimization.status}
                                                color={getStatusColor(optimization.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(optimization.created_at), 'yyyy-MM-dd HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            {optimization.best_fitness?.toFixed(4) || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {optimization.total_trades || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {optimization.win_rate ? `${(optimization.win_rate * 100).toFixed(2)}%` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => navigate(`/bots/${botId}/optimize/${optimization.id}`)}
                                                color="primary"
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(optimization.id)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default OptimizationList; 