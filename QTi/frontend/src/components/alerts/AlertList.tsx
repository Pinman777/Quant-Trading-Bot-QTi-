import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Switch,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { alertService, Alert, AlertSettings } from '../../services/alert';
import { formatDistanceToNow } from 'date-fns';

export const AlertList: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<AlertSettings>({
        position_limit_threshold: 10,
        enabled_exchanges: [],
        enabled_symbols: [],
        notification_channels: {
            email: false,
            telegram: false,
            web: true
        }
    });

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const data = await alertService.getAlerts();
            setAlerts(data);
            setError(null);
        } catch (err) {
            setError('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const data = await alertService.getAlertSettings();
            setSettings(data);
        } catch (err) {
            setError('Failed to load alert settings');
        }
    };

    useEffect(() => {
        loadAlerts();
        loadSettings();
        const interval = setInterval(loadAlerts, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (alertId: string) => {
        try {
            await alertService.markAlertAsRead(alertId);
            setAlerts(alerts.map(alert =>
                alert.id === alertId ? { ...alert, read: true } : alert
            ));
        } catch (err) {
            setError('Failed to mark alert as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await alertService.markAllAlertsAsRead();
            setAlerts(alerts.map(alert => ({ ...alert, read: true })));
        } catch (err) {
            setError('Failed to mark all alerts as read');
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        try {
            await alertService.deleteAlert(alertId);
            setAlerts(alerts.filter(alert => alert.id !== alertId));
        } catch (err) {
            setError('Failed to delete alert');
        }
    };

    const handleClearAll = async () => {
        try {
            await alertService.clearAllAlerts();
            setAlerts([]);
        } catch (err) {
            setError('Failed to clear all alerts');
        }
    };

    const handleSettingsSave = async () => {
        try {
            await alertService.updateAlertSettings(settings);
            setSettingsOpen(false);
        } catch (err) {
            setError('Failed to save alert settings');
        }
    };

    const getSeverityIcon = (severity: Alert['severity']) => {
        switch (severity) {
            case 'info':
                return <InfoIcon color="info" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            case 'error':
                return <ErrorIcon color="error" />;
            default:
                return <InfoIcon />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                    Alerts
                </Typography>
                <Box>
                    <IconButton onClick={() => setSettingsOpen(true)}>
                        <SettingsIcon />
                    </IconButton>
                    <Button
                        startIcon={<CheckCircleIcon />}
                        onClick={handleMarkAllAsRead}
                        disabled={alerts.every(alert => alert.read)}
                    >
                        Mark All as Read
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        onClick={handleClearAll}
                        disabled={alerts.length === 0}
                    >
                        Clear All
                    </Button>
                </Box>
            </Box>

            <List>
                {alerts.map((alert) => (
                    <ListItem
                        key={alert.id}
                        sx={{
                            bgcolor: alert.read ? 'transparent' : 'action.hover',
                            mb: 1,
                            borderRadius: 1
                        }}
                    >
                        <ListItemIcon>
                            {getSeverityIcon(alert.severity)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="subtitle1">
                                        {alert.message}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={alert.type}
                                        color={
                                            alert.type === 'position_limit' ? 'error' :
                                            alert.type === 'balance' ? 'warning' :
                                            alert.type === 'order' ? 'info' : 'default'
                                        }
                                    />
                                </Box>
                            }
                            secondary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        {alert.exchange} - {alert.symbol}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            }
                        />
                        <Box>
                            {!alert.read && (
                                <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(alert.id)}
                                >
                                    <NotificationsIcon />
                                </IconButton>
                            )}
                            <IconButton
                                size="small"
                                onClick={() => handleDeleteAlert(alert.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Alert Settings</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Position Limit Threshold (%)"
                                value={settings.position_limit_threshold}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    position_limit_threshold: Number(e.target.value)
                                })}
                                inputProps={{ min: 0, max: 100 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Enabled Exchanges</InputLabel>
                                <Select
                                    multiple
                                    value={settings.enabled_exchanges}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        enabled_exchanges: e.target.value as string[]
                                    })}
                                >
                                    <MenuItem value="binance">Binance</MenuItem>
                                    <MenuItem value="bybit">Bybit</MenuItem>
                                    <MenuItem value="okx">OKX</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Enabled Symbols</InputLabel>
                                <Select
                                    multiple
                                    value={settings.enabled_symbols}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        enabled_symbols: e.target.value as string[]
                                    })}
                                >
                                    <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
                                    <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
                                    <MenuItem value="SOL/USDT">SOL/USDT</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Notification Channels
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notification_channels.email}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notification_channels: {
                                                ...settings.notification_channels,
                                                email: e.target.checked
                                            }
                                        })}
                                    />
                                }
                                label="Email"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notification_channels.telegram}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notification_channels: {
                                                ...settings.notification_channels,
                                                telegram: e.target.checked
                                            }
                                        })}
                                    />
                                }
                                label="Telegram"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.notification_channels.web}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notification_channels: {
                                                ...settings.notification_channels,
                                                web: e.target.checked
                                            }
                                        })}
                                    />
                                }
                                label="Web"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSettingsSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 