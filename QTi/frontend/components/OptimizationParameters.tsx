import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ParameterRange {
    name: string;
    min: number;
    max: number;
    step?: number;
}

interface OptimizationParametersProps {
    botId: string;
    optimizationId?: string;
    onParametersChange: (parameters: ParameterRange[]) => void;
}

const OptimizationParameters: React.FC<OptimizationParametersProps> = ({
    botId,
    optimizationId,
    onParametersChange
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parameters, setParameters] = useState<ParameterRange[]>([]);

    useEffect(() => {
        if (optimizationId) {
            const fetchParameters = async () => {
                try {
                    const response = await fetch(`/api/optimize/${botId}/${optimizationId}/parameters`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch optimization parameters');
                    }
                    const data = await response.json();
                    setParameters(data);
                    onParametersChange(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                }
            };

            fetchParameters();
        }
    }, [botId, optimizationId, onParametersChange]);

    const handleAddParameter = () => {
        setParameters(prev => [
            ...prev,
            {
                name: '',
                min: 0,
                max: 100,
                step: 1
            }
        ]);
    };

    const handleRemoveParameter = (index: number) => {
        setParameters(prev => prev.filter((_, i) => i !== index));
    };

    const handleParameterChange = (index: number, field: keyof ParameterRange) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = field === 'name' ? event.target.value : parseFloat(event.target.value);
        setParameters(prev => {
            const newParameters = [...prev];
            newParameters[index] = {
                ...newParameters[index],
                [field]: value
            };
            return newParameters;
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            if (optimizationId) {
                const response = await fetch(`/api/optimize/${botId}/${optimizationId}/parameters`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(parameters)
                });

                if (!response.ok) {
                    throw new Error('Failed to save optimization parameters');
                }
            }

            onParametersChange(parameters);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Optimization Parameters
            </Typography>

            <Card>
                <CardContent>
                    <Grid container spacing={3}>
                        {parameters.map((param, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Parameter Name"
                                        value={param.name}
                                        onChange={handleParameterChange(index, 'name')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Min Value"
                                        type="number"
                                        value={param.min}
                                        onChange={handleParameterChange(index, 'min')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Max Value"
                                        type="number"
                                        value={param.max}
                                        onChange={handleParameterChange(index, 'max')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        fullWidth
                                        label="Step"
                                        type="number"
                                        value={param.step}
                                        onChange={handleParameterChange(index, 'step')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Box display="flex" alignItems="center" height="100%">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveParameter(index)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            </React.Fragment>
                        ))}

                        <Grid item xs={12}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddParameter}
                                variant="outlined"
                                sx={{ mr: 2 }}
                            >
                                Add Parameter
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Parameters'}
                            </Button>
                        </Grid>

                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default OptimizationParameters; 