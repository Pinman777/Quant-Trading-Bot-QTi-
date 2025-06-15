import React from 'react';
import {
    Container,
    Box,
    Typography,
    Paper
} from '@mui/material';
import { ExchangeManager } from '../components/exchanges/ExchangeManager';

const ExchangesPage: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Exchange Management
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Configure and manage your exchange connections. Add API keys to enable trading functionality.
                </Typography>

                <Paper sx={{ p: 3, mt: 3 }}>
                    <ExchangeManager />
                </Paper>
            </Box>
        </Container>
    );
};

export default ExchangesPage; 