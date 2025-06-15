import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketHook {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
}

export const useWebSocket = (url: string): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      reconnectTimeout.current = setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((topic: string) => {
    sendMessage({
      type: 'subscribe',
      topic
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((topic: string) => {
    sendMessage({
      type: 'unsubscribe',
      topic
    });
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe
  };
}; 