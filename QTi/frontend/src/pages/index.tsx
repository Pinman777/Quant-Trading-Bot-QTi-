import React, { useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2A3037' : '#f5f5f5',
  },
}));

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading />;
  }

  const menuItems = [
    {
      title: 'Exchanges',
      description: 'Manage your exchange connections and view positions',
      path: '/exchanges',
    },
    {
      title: 'Bots',
      description: 'Configure and monitor your trading bots',
      path: '/bots',
    },
    {
      title: 'Alerts',
      description: 'Set up and manage trading alerts',
      path: '/alerts',
    },
    {
      title: 'Remote',
      description: 'Manage remote servers and bots',
      path: '/remote',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          QTi Trading Platform
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          Your all-in-one trading solution
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Item onClick={() => router.push(item.path)}>
              <Typography variant="h6" component="h3" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Item>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 