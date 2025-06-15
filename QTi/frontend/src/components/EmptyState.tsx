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
  Add as AddIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  fullScreen?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  fullScreen = false
}) => {
  const theme = useTheme();

  const getDefaultIcon = () => {
    if (icon) return icon;

    if (action?.label.toLowerCase().includes('add')) {
      return <AddIcon sx={{ fontSize: 48 }} />;
    }

    if (action?.label.toLowerCase().includes('search')) {
      return <SearchIcon sx={{ fontSize: 48 }} />;
    }

    return <SettingsIcon sx={{ fontSize: 48 }} />;
  };

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
            <Box
              sx={{
                color: theme.palette.primary.main,
                mb: 2
              }}
            >
              {getDefaultIcon()}
            </Box>
            <Typography
              variant="h6"
              gutterBottom
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {description}
            </Typography>
            {action && (
              <Button
                variant="contained"
                startIcon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmptyState; 