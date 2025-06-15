import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  created_at: string;
  read: boolean;
  read_at?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isConnected, lastMessage, subscribe, unsubscribe } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/ws`
  );

  React.useEffect(() => {
    if (isConnected) {
      subscribe('notifications');
    }
    return () => {
      unsubscribe('notifications');
    };
  }, [isConnected, subscribe, unsubscribe]);

  React.useEffect(() => {
    if (lastMessage?.type === 'notification') {
      const notification = lastMessage.data as Notification;
      addNotification(notification);
    }
  }, [lastMessage]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 