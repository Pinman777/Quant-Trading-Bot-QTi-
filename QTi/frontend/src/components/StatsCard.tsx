import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  trend
}) => {
  const theme = useTheme();

  const getIcon = () => {
    if (icon) return icon;

    switch (color) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getIcon() && (
            <Box
              sx={{
                backgroundColor: `${theme.palette[color].main}15`,
                borderRadius: '50%',
                p: 1,
                mr: 2
              }}
            >
              {getIcon()}
            </Box>
          )}
          <Box>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" color={color}>
              {value}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend.isPositive ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend.isPositive ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 