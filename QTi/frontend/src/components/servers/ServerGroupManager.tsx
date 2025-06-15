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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  lastSync: string;
  configPath: string;
}

interface ServerGroup {
  id: string;
  name: string;
  description: string;
  servers: Server[];
}

interface ServerGroupManagerProps {
  groups: ServerGroup[];
  servers: Server[];
  onAddGroup: (group: Omit<ServerGroup, 'id'>) => void;
  onEditGroup: (id: string, group: Omit<ServerGroup, 'id'>) => void;
  onDeleteGroup: (id: string) => void;
}

const ServerGroupManager: React.FC<ServerGroupManagerProps> = ({
  groups,
  servers,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ServerGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedServers: [] as string[],
  });

  const handleOpenDialog = (group?: ServerGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description,
        selectedServers: group.servers.map((s) => s.id),
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        selectedServers: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      selectedServers: [],
    });
  };

  const handleSave = () => {
    const groupData = {
      name: formData.name,
      description: formData.description,
      servers: servers.filter((s) => formData.selectedServers.includes(s.id)),
    };

    if (editingGroup) {
      onEditGroup(editingGroup.id, groupData);
    } else {
      onAddGroup(groupData);
    }

    handleCloseDialog();
  };

  const handleServerToggle = (serverId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServers: prev.selectedServers.includes(serverId)
        ? prev.selectedServers.filter((id) => id !== serverId)
        : [...prev.selectedServers, serverId],
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Server Groups</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Group
        </Button>
      </Box>

      <List>
        {groups.map((group) => (
          <ListItem
            key={group.id}
            component={Paper}
            sx={{ mb: 1, p: 2 }}
          >
            <ListItemText
              primary={group.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {group.description}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {group.servers.map((server) => (
                      <Chip
                        key={server.id}
                        label={server.name}
                        size="small"
                        color={server.status === 'online' ? 'success' : 'default'}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Edit Group">
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(group)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Group">
                <IconButton
                  edge="end"
                  onClick={() => onDeleteGroup(group.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGroup ? 'Edit Server Group' : 'Add Server Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Select Servers
            </Typography>
            <List>
              {servers.map((server) => (
                <ListItem
                  key={server.id}
                  button
                  onClick={() => handleServerToggle(server.id)}
                  selected={formData.selectedServers.includes(server.id)}
                >
                  <ListItemText
                    primary={server.name}
                    secondary={`${server.host}:${server.port}`}
                  />
                  <Chip
                    size="small"
                    label={server.status}
                    color={server.status === 'online' ? 'success' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || formData.selectedServers.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServerGroupManager; 