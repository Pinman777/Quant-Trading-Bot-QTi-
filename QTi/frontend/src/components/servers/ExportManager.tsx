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
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ExportSchedule {
  id: string;
  name: string;
  type: 'export' | 'backup';
  format: 'csv' | 'excel';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  days: string[];
  destination: string;
  enabled: boolean;
}

interface ExportManagerProps {
  schedules: ExportSchedule[];
  onAddSchedule: (schedule: Omit<ExportSchedule, 'id'>) => void;
  onEditSchedule: (id: string, schedule: Omit<ExportSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleSchedule: (id: string) => void;
  onExportNow: (type: 'csv' | 'excel', dateRange: { start: Date; end: Date }) => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onToggleSchedule,
  onExportNow,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExportSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'export' as ExportSchedule['type'],
    format: 'csv' as ExportSchedule['format'],
    frequency: 'daily' as ExportSchedule['frequency'],
    time: '00:00',
    days: [] as string[],
    destination: '',
    enabled: true,
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const handleOpenDialog = (schedule?: ExportSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        type: schedule.type,
        format: schedule.format,
        frequency: schedule.frequency,
        time: schedule.time,
        days: schedule.days,
        destination: schedule.destination,
        enabled: schedule.enabled,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        type: 'export',
        format: 'csv',
        frequency: 'daily',
        time: '00:00',
        days: [],
        destination: '',
        enabled: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = () => {
    if (editingSchedule) {
      onEditSchedule(editingSchedule.id, formData);
    } else {
      onAddSchedule(formData);
    }
    handleCloseDialog();
  };

  const handleExport = () => {
    onExportNow(formData.format, dateRange);
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Export & Schedule</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Now
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Schedule
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Export Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={formData.format}
                  label="Format"
                  onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value as ExportSchedule['format'] }))}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(date) => setDateRange((prev) => ({ ...prev, start: date || new Date() }))}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(date) => setDateRange((prev) => ({ ...prev, end: date || new Date() }))}
                />
              </LocalizationProvider>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Scheduled Exports
            </Typography>
            <List>
              {schedules.map((schedule) => (
                <ListItem
                  key={schedule.id}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={schedule.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {schedule.type === 'export' ? 'Export' : 'Backup'} - {schedule.format.toUpperCase()}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={`${schedule.frequency} at ${schedule.time}`}
                          />
                          {schedule.days.length > 0 && (
                            <Chip
                              size="small"
                              label={schedule.days.join(', ')}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={schedule.enabled ? 'Disable Schedule' : 'Enable Schedule'}>
                      <IconButton
                        edge="end"
                        onClick={() => onToggleSchedule(schedule.id)}
                        color={schedule.enabled ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      >
                        <ScheduleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Schedule">
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDialog(schedule)}
                        sx={{ mr: 1 }}
                      >
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Schedule">
                      <IconButton
                        edge="end"
                        onClick={() => onDeleteSchedule(schedule.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Schedule Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as ExportSchedule['type'] }))}
              >
                <MenuItem value="export">Export</MenuItem>
                <MenuItem value="backup">Backup</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={formData.format}
                label="Format"
                onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value as ExportSchedule['format'] }))}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={formData.frequency}
                label="Frequency"
                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value as ExportSchedule['frequency'] }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Time"
                value={new Date(`2000-01-01T${formData.time}`)}
                onChange={(date) => setFormData((prev) => ({
                  ...prev,
                  time: date ? date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '00:00',
                }))}
              />
            </LocalizationProvider>
            {formData.frequency === 'weekly' && (
              <FormControl fullWidth>
                <InputLabel>Days</InputLabel>
                <Select
                  multiple
                  value={formData.days}
                  label="Days"
                  onChange={(e) => setFormData((prev) => ({ ...prev, days: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {weekDays.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Destination"
              value={formData.destination}
              onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
              fullWidth
              helperText="Enter path or URL for export destination"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.destination}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExportManager; 