import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface Integration {
  id: string;
  name: string;
  type: 'prometheus' | 'grafana' | 'datadog' | 'custom';
  url: string;
  apiKey?: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

interface ExternalMonitoringProps {
  integrations: Integration[];
  onAddIntegration: (integration: Omit<Integration, 'id' | 'status' | 'lastSync'>) => void;
  onEditIntegration: (id: string, integration: Omit<Integration, 'id' | 'status' | 'lastSync'>) => void;
  onDeleteIntegration: (id: string) => void;
  onToggleIntegration: (id: string) => void;
  onTestConnection: (id: string) => Promise<void>;
}

const ExternalMonitoring: React.FC<ExternalMonitoringProps> = ({
  integrations,
  onAddIntegration,
  onEditIntegration,
  onDeleteIntegration,
  onToggleIntegration,
  onTestConnection,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'prometheus' as Integration['type'],
    url: '',
    apiKey: '',
    enabled: true,
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenDialog = (integration?: Integration) => {
    if (integration) {
      setEditingIntegration(integration);
      setFormData({
        name: integration.name,
        type: integration.type,
        url: integration.url,
        apiKey: integration.apiKey || '',
        enabled: integration.enabled,
      });
    } else {
      setEditingIntegration(null);
      setFormData({
        name: '',
        type: 'prometheus',
        url: '',
        apiKey: '',
        enabled: true,
      });
    }
    setOpenDialog(true);
    setTestResult(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIntegration(null);
    setTestResult(null);
  };

  const handleSave = () => {
    if (editingIntegration) {
      onEditIntegration(editingIntegration.id, formData);
    } else {
      onAddIntegration(formData);
    }
    handleCloseDialog();
  };

  const handleTestConnection = async () => {
    if (!editingIntegration) return;
    setTesting(true);
    setTestResult(null);
    try {
      await onTestConnection(editingIntegration.id);
      setTestResult({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Connection failed. Please check your settings.' });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'success.main';
      case 'disconnected':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'disconnected':
        return <ErrorIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">External Monitoring</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Integration
        </Button>
      </Box>

      <List>
        {integrations.map((integration) => (
          <ListItem
            key={integration.id}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
          >
            <ListItemText
              primary={integration.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} - {integration.url}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={integration.enabled ? 'Disable Integration' : 'Enable Integration'}>
                  <Switch
                    edge="end"
                    checked={integration.enabled}
                    onChange={() => onToggleIntegration(integration.id)}
                  />
                </Tooltip>
                <Tooltip title="Test Connection">
                  <IconButton
                    edge="end"
                    onClick={() => handleTestConnection()}
                    sx={{ mr: 1 }}
                  >
                    {getStatusIcon(integration.status)}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Integration">
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(integration)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Integration">
                  <IconButton
                    edge="end"
                    onClick={() => onDeleteIntegration(integration.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIntegration ? 'Edit Integration' : 'Add Integration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Integration Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as Integration['type'] }))}
              >
                <MenuItem value="prometheus">Prometheus</MenuItem>
                <MenuItem value="grafana">Grafana</MenuItem>
                <MenuItem value="datadog">Datadog</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL"
              value={formData.url}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              fullWidth
              helperText="Enter the endpoint URL for the monitoring system"
            />
            <TextField
              label="API Key"
              value={formData.apiKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
              fullWidth
              type="password"
              helperText="Enter API key if required"
            />
            {testResult && (
              <Alert severity={testResult.success ? 'success' : 'error'}>
                {testResult.message}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {editingIntegration && (
            <Button
              onClick={handleTestConnection}
              disabled={testing}
              startIcon={<CheckCircleIcon />}
            >
              Test Connection
            </Button>
          )}
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.url}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExternalMonitoring; 