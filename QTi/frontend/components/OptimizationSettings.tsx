import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface OptimizationSettings {
    population_size: number;
    generations: number;
    mutation_rate: number;
    crossover_rate: number;
    elite_size: number;
    optimization_type: string;
    param_ranges: Record<string, [number, number]>;
}

interface OptimizationSettingsProps {
    botId: string;
    optimizationId?: string;
}

const OptimizationSettings: React.FC<OptimizationSettingsProps> = ({ botId, optimizationId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<OptimizationSettings>({
        population_size: 50,
        generations: 100,
        mutation_rate: 0.1,
        crossover_rate: 0.8,
        elite_size: 2,
        optimization_type: 'sharpe',
        param_ranges: {}
    });

    useEffect(() => {
        if (optimizationId) {
            const fetchSettings = async () => {
                try {
                    const response = await fetch(`/api/optimize/${botId}/${optimizationId}/settings`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch optimization settings');
                    }
                    const data = await response.json();
                    setSettings(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                }
            };

            fetchSettings();
        }
    }, [botId, optimizationId]);

    const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSettings(prev => ({
            ...prev,
            [field]: field.includes('rate') ? parseFloat(value) : parseInt(value, 10)
        }));
    };

    const handleSelectChange = (field: string) => (event: React.ChangeEvent<{ value: unknown }>) => {
        setSettings(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleParamRangeChange = (param: string, index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setSettings(prev => ({
            ...prev,
            param_ranges: {
                ...prev.param_ranges,
                [param]: [
                    index === 0 ? value : prev.param_ranges[param][0],
                    index === 1 ? value : prev.param_ranges[param][1]
                ]
            }
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = optimizationId
                ? `/api/optimize/${botId}/${optimizationId}/settings`
                : `/api/optimize/${botId}/settings`;
            const method = optimizationId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error('Failed to save optimization settings');
            }

            if (!optimizationId) {
                const data = await response.json();
                navigate(`/bots/${botId}/optimize/${data.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                {optimizationId ? 'Edit Optimization Settings' : 'New Optimization Settings'}
            </Typography>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Population Size"
                                    type="number"
                                    value={settings.population_size}
                                    onChange={handleInputChange('population_size')}
                                    required
                                    inputProps={{ min: 10, max: 1000 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Generations"
                                    type="number"
                                    value={settings.generations}
                                    onChange={handleInputChange('generations')}
                                    required
                                    inputProps={{ min: 10, max: 1000 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Mutation Rate"
                                    type="number"
                                    value={settings.mutation_rate}
                                    onChange={handleInputChange('mutation_rate')}
                                    required
                                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Crossover Rate"
                                    type="number"
                                    value={settings.crossover_rate}
                                    onChange={handleInputChange('crossover_rate')}
                                    required
                                    inputProps={{ min: 0, max: 1, step: 0.1 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Elite Size"
                                    type="number"
                                    value={settings.elite_size}
                                    onChange={handleInputChange('elite_size')}
                                    required
                                    inputProps={{ min: 1, max: 10 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Optimization Type</InputLabel>
                                    <Select
                                        value={settings.optimization_type}
                                        onChange={handleSelectChange('optimization_type')}
                                        label="Optimization Type"
                                    >
                                        <MenuItem value="sharpe">Sharpe Ratio</MenuItem>
                                        <MenuItem value="sortino">Sortino Ratio</MenuItem>
                                        <MenuItem value="profit">Total Profit</MenuItem>
                                        <MenuItem value="win_rate">Win Rate</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Parameter Ranges
                                </Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(settings.param_ranges).map(([param, [min, max]]) => (
                                        <React.Fragment key={param}>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label={`${param} Min`}
                                                    type="number"
                                                    value={min}
                                                    onChange={handleParamRangeChange(param, 0)}
                                                    required
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label={`${param} Max`}
                                                    type="number"
                                                    value={max}
                                                    onChange={handleParamRangeChange(param, 1)}
                                                    required
                                                />
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            </Grid>

                            {error && (
                                <Grid item xs={12}>
                                    <Alert severity="error">{error}</Alert>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    fullWidth
                                >
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : optimizationId ? (
                                        'Update Settings'
                                    ) : (
                                        'Create Optimization'
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default OptimizationSettings; 