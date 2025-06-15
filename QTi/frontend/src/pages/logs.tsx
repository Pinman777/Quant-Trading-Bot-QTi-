import React, { useEffect, useState } from 'react';
import { Container, Typography, Alert, Box } from '@mui/material';
import LogViewer from '../components/logs/LogViewer';
import { useWebSocket } from '../hooks/useWebSocket';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/logs');

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'log') {
        setLogs((prev) => [...prev, data.log]);
      }
    }
  }, [lastMessage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/logs/download');
      if (!response.ok) {
        throw new Error('Failed to download logs');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qti-logs-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Logs downloaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:8000/api/logs', {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to clear logs');
        }
        setLogs([]);
        setSuccess('Logs cleared successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear logs');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          System Logs
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

        <LogViewer
          logs={logs}
          onRefresh={fetchLogs}
          onDownload={handleDownload}
          onClear={handleClear}
          loading={loading}
          error={error || undefined}
        />
      </Box>
    </Container>
  );
};

export default LogsPage; 