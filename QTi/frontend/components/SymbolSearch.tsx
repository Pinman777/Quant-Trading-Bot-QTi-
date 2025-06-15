import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface SymbolSearchProps {
  onSymbolSelect: (symbol: string) => void;
}

interface SymbolData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSymbolSelect }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SymbolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let active = true;

    const fetchSymbols = async () => {
      if (inputValue.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/market/search?query=${inputValue}`);
        if (!response.ok) throw new Error('Failed to fetch symbols');
        const data = await response.json();
        if (active) {
          setOptions(data);
        }
      } catch (error) {
        console.error('Error fetching symbols:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSymbols, 300);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [inputValue]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
      onChange={(_, value) => {
        if (value) {
          onSymbolSelect(value.symbol);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Symbol"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem {...props}>
          <ListItemIcon>
            {option.change24h >= 0 ? (
              <TrendingUp color="success" />
            ) : (
              <TrendingDown color="error" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={`${option.symbol} - ${option.name}`}
            secondary={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" component="span">
                  ${option.price.toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  color={option.change24h >= 0 ? 'success.main' : 'error.main'}
                >
                  {option.change24h >= 0 ? '+' : ''}{option.change24h.toFixed(2)}%
                </Typography>
              </Box>
            }
          />
        </ListItem>
      )}
      PaperComponent={({ children }) => (
        <Paper sx={{ mt: 1 }}>
          <List>{children}</List>
        </Paper>
      )}
    />
  );
};

export default SymbolSearch; 