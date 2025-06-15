import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  NotificationsActive,
  Delete,
  Add,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  price: number;
  triggered: boolean;
}

const PriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<PriceAlert>>({
    symbol: '',
    type: 'above',
    price: 0
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    // Загрузка сохраненных уведомлений
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    // Подписка на WebSocket для получения обновлений цен
    const ws = new WebSocket('ws://localhost:8000/ws/prices');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      checkAlerts(data);
    };

    return () => {
      ws.close();
    };
  }, []);

  const checkAlerts = (priceData: { symbol: string; price: number }) => {
    const updatedAlerts = alerts.map(alert => {
      if (alert.symbol === priceData.symbol && !alert.triggered) {
        const triggered = alert.type === 'above' 
          ? priceData.price >= alert.price 
          : priceData.price <= alert.price;

        if (triggered) {
          setNotification({
            open: true,
            message: `${alert.symbol} price ${alert.type === 'above' ? 'rose above' : 'fell below'} ${alert.price}`,
            severity: 'warning'
          });
        }

        return { ...alert, triggered };
      }
      return alert;
    });

    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.price) {
      setNotification({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol!,
      type: newAlert.type as 'above' | 'below',
      price: newAlert.price,
      triggered: false
    };

    setAlerts([...alerts, alert]);
    localStorage.setItem('priceAlerts', JSON.stringify([...alerts, alert]));
    setOpen(false);
    setNewAlert({ symbol: '', type: 'above', price: 0 });
  };

  const handleDeleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Price Alerts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Alert
        </Button>
      </Box>

      <Paper>
        <List>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDeleteAlert(alert.id)}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon>
                {alert.type === 'above' ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={alert.symbol}
                secondary={`Alert when price ${alert.type} ${alert.price}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Price Alert</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Symbol"
            fullWidth
            value={newAlert.symbol}
            onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Alert Type</InputLabel>
            <Select
              value={newAlert.type}
              onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as 'above' | 'below' })}
            >
              <MenuItem value="above">Price Above</MenuItem>
              <MenuItem value="below">Price Below</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newAlert.price}
            onChange={(e) => setNewAlert({ ...newAlert, price: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAlert} variant="contained">
            Add Alert
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PriceAlerts; 