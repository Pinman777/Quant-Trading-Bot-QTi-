import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Grid
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';

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

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Хлебные крошки */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" passHref legacyBehavior>
            <MuiLink color="inherit" underline="hover">
              Home
            </MuiLink>
          </Link>
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>

        {/* Заголовок */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your trading bots and market overview
          </Typography>
        </Box>

        {/* Основной контент */}
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 3,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
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
        </Paper>

        {/* Компонент Dashboard */}
        {user && <Dashboard userId={user.id} />}
      </Container>
    </Box>
  );
};

export default DashboardPage; 