import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push('/')}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage; 