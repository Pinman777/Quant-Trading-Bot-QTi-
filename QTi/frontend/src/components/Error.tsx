import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

const Error: React.FC<ErrorProps> = ({
  message,
  onRetry,
  fullScreen = false
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '200px',
        backgroundColor: fullScreen ? theme.palette.background.default : 'transparent'
      }}
    >
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <ErrorIcon
              color="error"
              sx={{ fontSize: 48, mb: 2 }}
            />
            <Typography
              variant="h6"
              color="error"
              gutterBottom
            >
              Error
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {message}
            </Typography>
            {onRetry && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
              >
                Retry
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Error; 