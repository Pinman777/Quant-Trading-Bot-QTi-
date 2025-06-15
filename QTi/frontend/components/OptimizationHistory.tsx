import React from 'react';
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
    Paper
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface OptimizationHistory {
    generation: number;
    best_fitness: number;
    avg_fitness: number;
    std_fitness: number;
    best_individual: Record<string, number>;
}

interface OptimizationHistoryProps {
    history: OptimizationHistory[];
}

const OptimizationHistory: React.FC<OptimizationHistoryProps> = ({ history }) => {
    const formatNumber = (value: number) => value.toFixed(4);

    const chartData: ChartData<'line', number[], string> = {
        labels: history.map(h => h.generation.toString()),
        datasets: [
            {
                label: 'Best Fitness',
                data: history.map(h => h.best_fitness),
                borderColor: '#8884d8',
                backgroundColor: '#8884d8',
                tension: 0.1
            },
            {
                label: 'Average Fitness',
                data: history.map(h => h.avg_fitness),
                borderColor: '#82ca9d',
                backgroundColor: '#82ca9d',
                tension: 0.1
            },
            {
                label: 'Standard Deviation',
                data: history.map(h => h.std_fitness),
                borderColor: '#ffc658',
                backgroundColor: '#ffc658',
                tension: 0.1
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: 'Fitness Evolution'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Optimization History
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Fitness Evolution
                    </Typography>
                    <Box height={400}>
                        <Line data={chartData} options={chartOptions} />
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Best Parameters by Generation
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Generation</TableCell>
                                    <TableCell>Best Fitness</TableCell>
                                    {Object.keys(history[0]?.best_individual || {}).map(param => (
                                        <TableCell key={param}>{param}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{record.generation}</TableCell>
                                        <TableCell>{formatNumber(record.best_fitness)}</TableCell>
                                        {Object.entries(record.best_individual).map(([param, value]) => (
                                            <TableCell key={param}>{formatNumber(value)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Statistics by Generation
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Generation</TableCell>
                                    <TableCell>Best Fitness</TableCell>
                                    <TableCell>Average Fitness</TableCell>
                                    <TableCell>Standard Deviation</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{record.generation}</TableCell>
                                        <TableCell>{formatNumber(record.best_fitness)}</TableCell>
                                        <TableCell>{formatNumber(record.avg_fitness)}</TableCell>
                                        <TableCell>{formatNumber(record.std_fitness)}</TableCell>
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

export default OptimizationHistory; 