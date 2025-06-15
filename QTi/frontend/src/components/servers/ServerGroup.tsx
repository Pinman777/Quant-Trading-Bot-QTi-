import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Sync as SyncIcon,
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

interface ServerGroupProps {
  name: string;
  servers: Server[];
  onSync: (serverIds: string[]) => void;
}

const ServerGroup: React.FC<ServerGroupProps> = ({ name, servers, onSync }) => {
  const [expanded, setExpanded] = React.useState(true);
  const onlineServers = servers.filter((server) => server.status === 'online');

  const handleSyncAll = () => {
    onSync(onlineServers.map((server) => server.id));
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{name}</Typography>
          <Chip
            label={`${onlineServers.length}/${servers.length} online`}
            color={onlineServers.length > 0 ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <Box>
          {onlineServers.length > 0 && (
            <Tooltip title="Sync All Servers">
              <IconButton onClick={handleSyncAll} size="small">
                <SyncIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {servers.map((server) => (
            <Box
              key={server.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box>
                <Typography variant="body1">{server.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {server.host}:{server.port}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={server.status}
                  color={server.status === 'online' ? 'success' : 'default'}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Last sync: {server.lastSync}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ServerGroup; 