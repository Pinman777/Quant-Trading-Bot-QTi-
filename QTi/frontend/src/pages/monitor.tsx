import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import BotMonitor from '../components/BotMonitor';

const MonitorPage: React.FC = () => {
    return (
        <Container maxWidth="xl">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Bot Monitor
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    Monitor your trading bots in real-time, view performance metrics, and manage positions.
                </Typography>
                <BotMonitor />
            </Box>
        </Container>
    );
};

export default MonitorPage; 