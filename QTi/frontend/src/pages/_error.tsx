import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const ErrorPage: React.FC<ErrorProps> = ({ statusCode }) => {
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
        {statusCode || 'Error'}
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </Box>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage; 