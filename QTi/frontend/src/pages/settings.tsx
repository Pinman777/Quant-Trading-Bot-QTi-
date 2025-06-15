import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`settings-tabpanel-${index}`}
    aria-labelledby={`settings-tab-${index}`}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </Box>
);

const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const theme = useTheme();

  // Состояние профиля
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: '/avatar.png'
  });

  // Состояние безопасности
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    passwordChangeRequired: false,
    sessionTimeout: 30,
    ipWhitelist: [] as string[]
  });

  // Состояние уведомлений
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    telegramNotifications: false,
    tradeAlerts: true,
    systemAlerts: true,
    weeklyReports: true
  });

  // Состояние предпочтений
  const [preferences, setPreferences] = useState({
    darkMode: theme.palette.mode === 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [field]: event.target.value });
  };

  const handleSecurityChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [field]: event.target.value });
  };

  const handleNotificationChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({ ...notifications, [field]: event.target.checked });
  };

  const handlePreferenceChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({ ...preferences, [field]: event.target.checked });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Здесь будет API-запрос для сохранения профиля
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Здесь будет API-запрос для сохранения настроек безопасности
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setSuccess('Security settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Здесь будет API-запрос для сохранения настроек уведомлений
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setSuccess('Notification settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Здесь будет API-запрос для сохранения предпочтений
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      setSuccess('Preferences updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PaletteIcon />} label="Preferences" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mx: 2, mt: 2 }}>
            {success}
          </Alert>
        )}

        {/* Профиль */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profile.avatar}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper'
                  }}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={profile.name}
                    onChange={handleProfileChange('name')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={handleProfileChange('email')}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Безопасность */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={security.twoFactorEnabled}
                    onChange={(e) => setSecurity({ ...security, twoFactorEnabled: e.target.checked })}
                  />
                }
                label="Two-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={security.passwordChangeRequired}
                    onChange={(e) => setSecurity({ ...security, passwordChangeRequired: e.target.checked })}
                  />
                }
                label="Require Password Change Every 90 Days"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (minutes)"
                value={security.sessionTimeout}
                onChange={handleSecurityChange('sessionTimeout')}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSaveSecurity}
                disabled={loading}
              >
                Save Security Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Уведомления */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.telegramNotifications}
                    onChange={handleNotificationChange('telegramNotifications')}
                  />
                }
                label="Telegram Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.tradeAlerts}
                    onChange={handleNotificationChange('tradeAlerts')}
                  />
                }
                label="Trade Alerts"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.systemAlerts}
                    onChange={handleNotificationChange('systemAlerts')}
                  />
                }
                label="System Alerts"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.weeklyReports}
                    onChange={handleNotificationChange('weeklyReports')}
                  />
                }
                label="Weekly Reports"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSaveNotifications}
                disabled={loading}
              >
                Save Notification Settings
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Предпочтения */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.darkMode}
                    onChange={handlePreferenceChange('darkMode')}
                  />
                }
                label="Dark Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Language"
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                SelectProps={{
                  native: true
                }}
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                SelectProps={{
                  native: true
                }}
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Date Format"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                SelectProps={{
                  native: true
                }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSavePreferences}
                disabled={loading}
              >
                Save Preferences
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SettingsPage; 