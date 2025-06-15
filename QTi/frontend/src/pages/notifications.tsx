import React, { useEffect, useState } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import NotificationManager from '../components/notifications/NotificationManager';
import { useWebSocket } from '../hooks/useWebSocket';

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
  id: string;
  name: string;
  type: 'trade' | 'error' | 'system' | 'custom';
  message: string;
  conditions: Condition[];
  recipients: Recipient[];
  enabled: boolean;
  cooldown: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/notifications');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'notification_update') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === data.notification.id ? data.notification : n))
        );
      } else if (data.type === 'notification_created') {
        setNotifications((prev) => [...prev, data.notification]);
      } else if (data.type === 'notification_deleted') {
        setNotifications((prev) => prev.filter((n) => n.id !== data.notification_id));
      }
    }
  }, [lastMessage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAdd = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const data = await response.json();
      setNotifications((prev) => [...prev, data]);
      setSuccess('Notification created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string, notification: Partial<Notification>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification');
      }

      const data = await response.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...data } : n))
      );
      setSuccess('Notification updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSuccess('Notification deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/notifications/${id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate notification');
      }

      const data = await response.json();
      setNotifications((prev) => [...prev, data]);
      setSuccess('Notification duplicated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <NotificationManager
          notifications={notifications}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onRefresh={fetchNotifications}
          loading={loading}
          error={error || undefined}
        />
      </Box>
    </Container>
  );
};

export default NotificationsPage; 