import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ExchangeApiKeysProps {
  botId: string;
}

interface ApiKey {
  id: string;
  exchange: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'inactive' | 'expired';
}

const ExchangeApiKeys: React.FC<ExchangeApiKeysProps> = ({ botId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState<Partial<ApiKey>>({
    exchange: '',
    name: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    permissions: [],
    status: 'active'
  });

  useEffect(() => {
    fetchApiKeys();
  }, [botId]);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/api-keys`);
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (key?: ApiKey) => {
    if (key) {
      setEditingKey(key);
      setFormData({
        ...key,
        apiKey: '••••••••' + key.apiKey.slice(-4),
        apiSecret: '••••••••' + key.apiSecret.slice(-4),
        passphrase: key.passphrase ? '••••••••' + key.passphrase.slice(-4) : ''
      });
    } else {
      setEditingKey(null);
      setFormData({
        exchange: '',
        name: '',
        apiKey: '',
        apiSecret: '',
        passphrase: '',
        permissions: [],
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingKey(null);
    setFormData({
      exchange: '',
      name: '',
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      permissions: [],
      status: 'active'
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permission]
        : (prev.permissions || []).filter(p => p !== permission)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const url = editingKey
        ? `/api/bots/${botId}/api-keys/${editingKey.id}`
        : `/api/bots/${botId}/api-keys`;

      const response = await fetch(url, {
        method: editingKey ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save API key');
      }

      setSuccess(editingKey ? 'API key updated successfully' : 'API key added successfully');
      handleDialogClose();
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/api-keys/${keyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setSuccess('API key deleted successfully');
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (keyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bots/${botId}/api-keys/${keyId}/test`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to test API key connection');
      }

      setSuccess('API key connection test successful');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowSecret = (keyId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (loading && !apiKeys.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Exchange API Keys</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
          >
            Add API Key
          </Button>
        </Box>

        <Grid container spacing={2}>
          {apiKeys.map((key) => (
            <Grid item xs={12} key={key.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{key.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Exchange: {key.exchange}
                      </Typography>
                    </Box>
                    <Box>
                      <Tooltip title="Test Connection">
                        <IconButton
                          onClick={() => handleTestConnection(key.id)}
                          sx={{ mr: 1 }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleDialogOpen(key)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(key.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="API Key"
                        value={showSecrets[key.id] ? key.apiKey : '••••••••' + key.apiKey.slice(-4)}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => toggleShowSecret(key.id)}
                                edge="end"
                              >
                                {showSecrets[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="API Secret"
                        value={showSecrets[key.id] ? key.apiSecret : '••••••••' + key.apiSecret.slice(-4)}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => toggleShowSecret(key.id)}
                                edge="end"
                              >
                                {showSecrets[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    {key.passphrase && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Passphrase"
                          value={showSecrets[key.id] ? key.passphrase : '••••••••' + key.passphrase.slice(-4)}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => toggleShowSecret(key.id)}
                                  edge="end"
                                >
                                  {showSecrets[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status: {key.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(key.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Used: {new Date(key.lastUsed).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingKey ? 'Edit API Key' : 'Add API Key'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Exchange</InputLabel>
                    <Select
                      value={formData.exchange}
                      label="Exchange"
                      onChange={(e) => handleInputChange('exchange', e.target.value)}
                    >
                      <MenuItem value="binance">Binance</MenuItem>
                      <MenuItem value="bybit">Bybit</MenuItem>
                      <MenuItem value="okx">OKX</MenuItem>
                      <MenuItem value="kucoin">KuCoin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Key"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Secret"
                    value={formData.apiSecret}
                    onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                    type="password"
                  />
                </Grid>
                {formData.exchange === 'kucoin' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Passphrase"
                      value={formData.passphrase}
                      onChange={(e) => handleInputChange('passphrase', e.target.value)}
                      type="password"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Permissions
                  </Typography>
                  <Grid container spacing={1}>
                    {['read', 'trade', 'withdraw'].map((permission) => (
                      <Grid item xs={12} sm={4} key={permission}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.permissions?.includes(permission)}
                              onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                            />
                          }
                          label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
            >
              {editingKey ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ExchangeApiKeys; 