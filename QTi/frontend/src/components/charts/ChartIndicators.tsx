import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { IChartApi, ISeriesApi } from 'lightweight-charts';

interface Indicator {
  id: string;
  name: string;
  type: 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger';
  params: {
    [key: string]: number;
  };
  series: ISeriesApi<"Line"> | null;
}

interface ChartIndicatorsProps {
  chart: IChartApi | null;
  onIndicatorAdd: (indicator: Indicator) => void;
  onIndicatorRemove: (id: string) => void;
  onIndicatorUpdate: (id: string, params: { [key: string]: number }) => void;
}

const ChartIndicators: React.FC<ChartIndicatorsProps> = ({
  chart,
  onIndicatorAdd,
  onIndicatorRemove,
  onIndicatorUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleIndicatorSelect = (type: Indicator['type']) => {
    const defaultParams = {
      sma: { period: 20 },
      ema: { period: 20 },
      rsi: { period: 14 },
      macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      bollinger: { period: 20, stdDev: 2 },
    };

    const newIndicator: Indicator = {
      id: `${type}-${Date.now()}`,
      name: type.toUpperCase(),
      type,
      params: defaultParams[type],
      series: null,
    };

    onIndicatorAdd(newIndicator);
    handleMenuClose();
  };

  const handleSettingsOpen = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    // TODO: Implement settings dialog
  };

  const indicatorTypes = [
    { type: 'sma', name: 'Simple Moving Average' },
    { type: 'ema', name: 'Exponential Moving Average' },
    { type: 'rsi', name: 'Relative Strength Index' },
    { type: 'macd', name: 'Moving Average Convergence Divergence' },
    { type: 'bollinger', name: 'Bollinger Bands' },
  ];

  return (
    <Box>
      <Tooltip title="Indicators">
        <IconButton onClick={handleMenuOpen} size="small" sx={{ color: '#FFFFFF' }}>
          <TimelineIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#1A2B44',
            color: '#FFFFFF',
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Add Indicator</Typography>
        </MenuItem>
        <Divider sx={{ bgcolor: '#2B3B54' }} />
        {indicatorTypes.map(({ type, name }) => (
          <MenuItem
            key={type}
            onClick={() => handleIndicatorSelect(type as Indicator['type'])}
            sx={{
              '&:hover': {
                bgcolor: '#2B3B54',
              },
            }}
          >
            <ListItemIcon>
              <AddIcon sx={{ color: '#00C4B4' }} />
            </ListItemIcon>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Menu>

      {/* TODO: Add settings dialog for indicator parameters */}
    </Box>
  );
};

export default ChartIndicators; 