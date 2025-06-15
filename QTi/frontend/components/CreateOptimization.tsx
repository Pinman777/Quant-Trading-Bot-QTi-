import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ParameterRange {
    name: string;
    min: number;
    max: number;
    step: number;
}

interface CreateOptimizationProps {
    botId: string;
    onOptimizationCreated: () => void;
}

type OptimizationType = 'SHARPE' | 'SORTINO' | 'PROFIT' | 'WIN_RATE';

const CreateOptimization: React.FC<CreateOptimizationProps> = ({ botId, onOptimizationCreated }) => {
    const [name, setName] = useState('');
    const [optimizationType, setOptimizationType] = useState<OptimizationType>('SHARPE');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [parameterRanges, setParameterRanges] = useState<ParameterRange[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOptimizationTypeChange = (event: SelectChangeEvent) => {
        setOptimizationType(event.target.value as OptimizationType);
    };

    const handleAddParameter = () => {
        setParameterRanges([
            ...parameterRanges,
            { name: '', min: 0, max: 100, step: 1 }
        ]);
    };

    const handleRemoveParameter = (index: number) => {
        setParameterRanges(parameterRanges.filter((_, i) => i !== index));
    };

    const handleParameterChange = (index: number, field: keyof ParameterRange, value: string | number) => {
        const newRanges = [...parameterRanges];
        newRanges[index] = {
            ...newRanges[index],
            [field]: field === 'name' ? value : Number(value)
        };
        setParameterRanges(newRanges);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`/api/optimize/${botId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    optimization_type: optimizationType,
                    start_date: startDate?.toISOString(),
                    end_date: endDate?.toISOString(),
                    param_ranges: parameterRanges
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create optimization');
            }

            onOptimizationCreated();
            // Сброс формы
            setName('');
            setOptimizationType('SHARPE');
            setStartDate(null);
            setEndDate(null);
            setParameterRanges([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Create New Optimization
            </Typography>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Основные параметры */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Optimization Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Optimization Type</InputLabel>
                                    <Select
                                        value={optimizationType}
                                        label="Optimization Type"
                                        onChange={handleOptimizationTypeChange}
                                    >
                                        <MenuItem value="SHARPE">Sharpe Ratio</MenuItem>
                                        <MenuItem value="SORTINO">Sortino Ratio</MenuItem>
                                        <MenuItem value="PROFIT">Total Profit</MenuItem>
                                        <MenuItem value="WIN_RATE">Win Rate</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Даты */}
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Параметры оптимизации */}
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">Parameter Ranges</Typography>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={handleAddParameter}
                                        variant="outlined"
                                    >
                                        Add Parameter
                                    </Button>
                                </Box>

                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Parameter Name</TableCell>
                                                <TableCell>Min Value</TableCell>
                                                <TableCell>Max Value</TableCell>
                                                <TableCell>Step</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {parameterRanges.map((param, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <TextField
                                                            value={param.name}
                                                            onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                                                            fullWidth
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            value={param.min}
                                                            onChange={(e) => handleParameterChange(index, 'min', e.target.value)}
                                                            fullWidth
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            value={param.max}
                                                            onChange={(e) => handleParameterChange(index, 'max', e.target.value)}
                                                            fullWidth
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            type="number"
                                                            value={param.step}
                                                            onChange={(e) => handleParameterChange(index, 'step', e.target.value)}
                                                            fullWidth
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => handleRemoveParameter(index)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            {/* Сообщения об ошибках */}
                            {error && (
                                <Grid item xs={12}>
                                    <Alert severity="error">{error}</Alert>
                                </Grid>
                            )}

                            {/* Кнопка отправки */}
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Create Optimization'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreateOptimization; 