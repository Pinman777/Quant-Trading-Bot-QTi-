import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        backgroundColor: fullScreen ? theme.palette.background.default : 'transparent'
      }}
    >
      <CircularProgress />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading; 