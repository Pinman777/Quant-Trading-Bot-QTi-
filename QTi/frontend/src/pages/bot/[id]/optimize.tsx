import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import StrategyOptimizer from '../../../components/StrategyOptimizer';

const OptimizePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBotStrategy();
    }
  }, [id]);

  const fetchBotStrategy = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bot details');
      }

      const data = await response.json();
      setStrategy(data.strategy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Bot ID not provided</Alert>
      </Container>
    );
  }

  if (!strategy) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Strategy not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <ArrowBackIcon
          sx={{ cursor: 'pointer', mr: 2 }}
          onClick={() => router.back()}
        />
        <Typography variant="h4">Strategy Optimization</Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <StrategyOptimizer botId={id as string} strategy={strategy} />
      </Paper>
    </Container>
  );
};

export default OptimizePage; 