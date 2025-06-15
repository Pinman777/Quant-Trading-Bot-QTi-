import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface Condition {
  type: 'price' | 'volume' | 'indicator' | 'custom';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'starts_with' | 'ends_with';
  value: string | number;
  metric?: string;
}

interface Recipient {
  type: 'email' | 'telegram' | 'webhook';
  value: string;
  enabled: boolean;
}

interface Notification {
  id?: string;
  name: string;
  type: 'trade' | 'error' | 'system' | 'custom';
  message: string;
  conditions: Condition[];
  recipients: Recipient[];
  enabled: boolean;
  cooldown: number;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationFormProps {
  initialData?: Notification;
  onSave: (data: Notification) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

const NotificationForm: React.FC<NotificationFormProps> = ({
  initialData,
  onSave,
  onCancel,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<Notification>(
    initialData || {
      name: '',
      type: 'trade',
      message: '',
      conditions: [],
      recipients: [],
      enabled: true,
      cooldown: 300,
      priority: 'medium',
    }
  );

  const [showHelp, setShowHelp] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConditionChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newConditions = [...prev.conditions];
      newConditions[index] = {
        ...newConditions[index],
        [field]: value,
      };
      return {
        ...prev,
        conditions: newConditions,
      };
    });
  };

  const handleAddCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          type: 'price',
          operator: '>',
          value: '',
        },
      ],
    }));
  };

  const handleRemoveCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleRecipientChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newRecipients = [...prev.recipients];
      newRecipients[index] = {
        ...newRecipients[index],
        [field]: value,
      };
      return {
        ...prev,
        recipients: newRecipients,
      };
    });
  };

  const handleAddRecipient = () => {
    setFormData((prev) => ({
      ...prev,
      recipients: [
        ...prev.recipients,
        {
          type: 'email',
          value: '',
          enabled: true,
        },
      ],
    }));
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const getOperatorsForType = (type: string) => {
    switch (type) {
      case 'price':
      case 'volume':
        return ['>', '<', '>=', '<=', '==', '!='];
      case 'indicator':
        return ['>', '<', '>=', '<=', '==', '!='];
      case 'custom':
        return ['contains', 'starts_with', 'ends_with'];
      default:
        return [];
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {initialData ? 'Edit Notification' : 'New Notification'}
        </Typography>
        <Box>
          <Tooltip title="Help">
            <IconButton onClick={() => setShowHelp(!showHelp)}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={showHelp}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notification Help
          </Typography>
          <Typography variant="body2">
            • Basic Settings: Configure the basic parameters of your notification.
            <br />
            • Conditions: Set up the conditions that trigger the notification.
            <br />
            • Recipients: Add the channels and recipients for the notification.
            <br />
            • Advanced Settings: Configure cooldown and priority settings.
          </Typography>
        </Alert>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Notification Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="trade">Trade</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            multiline
            rows={3}
            required
            helperText="Use {variable} for dynamic values"
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Conditions</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddCondition}
              variant="outlined"
            >
              Add Condition
            </Button>
          </Box>

          {formData.conditions.map((condition, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={condition.type}
                      label="Type"
                      onChange={(e) => handleConditionChange(index, 'type', e.target.value)}
                    >
                      <MenuItem value="price">Price</MenuItem>
                      <MenuItem value="volume">Volume</MenuItem>
                      <MenuItem value="indicator">Indicator</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={condition.operator}
                      label="Operator"
                      onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                    >
                      {getOperatorsForType(condition.type).map((op) => (
                        <MenuItem key={op} value={op}>
                          {op}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  {condition.type === 'indicator' ? (
                    <Autocomplete
                      freeSolo
                      options={['RSI', 'MACD', 'Bollinger Bands', 'Moving Average']}
                      value={condition.metric || ''}
                      onChange={(_, value) => handleConditionChange(index, 'metric', value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Indicator"
                          fullWidth
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Value"
                      type={condition.type === 'price' || condition.type === 'volume' ? 'number' : 'text'}
                      value={condition.value}
                      onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveCondition(index)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Recipients</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddRecipient}
              variant="outlined"
            >
              Add Recipient
            </Button>
          </Box>

          {formData.recipients.map((recipient, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={recipient.type}
                      label="Type"
                      onChange={(e) => handleRecipientChange(index, 'type', e.target.value)}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="telegram">Telegram</MenuItem>
                      <MenuItem value="webhook">Webhook</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label={
                      recipient.type === 'email'
                        ? 'Email Address'
                        : recipient.type === 'telegram'
                        ? 'Telegram Chat ID'
                        : 'Webhook URL'
                    }
                    type={recipient.type === 'email' ? 'email' : 'text'}
                    value={recipient.value}
                    onChange={(e) => handleRecipientChange(index, 'value', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveRecipient(index)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cooldown (seconds)"
            type="number"
            value={formData.cooldown}
            onChange={(e) => handleChange('cooldown', Number(e.target.value))}
            InputProps={{
              inputProps: { min: 0 },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
              />
            }
            label="Enabled"
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<CancelIcon />}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => onSave(formData)}
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Notification'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NotificationForm; 