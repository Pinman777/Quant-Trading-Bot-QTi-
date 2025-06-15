import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onClose,
  onMarkAsRead
}) => {
  const theme = useTheme();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  backgroundColor: notification.read
                    ? 'transparent'
                    : `${getColor(notification.type)}15`,
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>{getIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                />
                <Box>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => onClose(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Notifications; 