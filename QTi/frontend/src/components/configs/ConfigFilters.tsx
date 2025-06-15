import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface ConfigFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  exchangeFilter: string;
  onExchangeChange: (value: string) => void;
  strategyFilter: string;
  onStrategyChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

const ConfigFilters: React.FC<ConfigFiltersProps> = ({
  searchQuery,
  onSearchChange,
  exchangeFilter,
  onExchangeChange,
  strategyFilter,
  onStrategyChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <FilterPaper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Поиск"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по названию или паре..."
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Биржа</InputLabel>
            <Select
              value={exchangeFilter}
              label="Биржа"
              onChange={(e) => onExchangeChange(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="Binance">Binance</MenuItem>
              <MenuItem value="Bybit">Bybit</MenuItem>
              <MenuItem value="OKX">OKX</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Стратегия</InputLabel>
            <Select
              value={strategyFilter}
              label="Стратегия"
              onChange={(e) => onStrategyChange(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="Grid">Grid</MenuItem>
              <MenuItem value="DCA">DCA</MenuItem>
              <MenuItem value="RSI">RSI</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="inactive">Неактивные</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </FilterPaper>
  );
};

export default ConfigFilters; 