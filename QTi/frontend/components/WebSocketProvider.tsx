import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type BotStatusType = 'running' | 'stopped' | 'error';
export type RemoteServerStatus = 'connected' | 'disconnected';
export type WebSocketMessageType = 
  | 'bot_status' 
  | 'error' 
  | 'system' 
  | 'remotes_list' 
  | 'remote_added' 
  | 'remote_deleted' 
  | 'remote_synced' 
  | 'remote_status';

export interface BotStatus {
  name: string;
  status: BotStatusType;
  pid: number | null;
  uptime: number | null;
  profit: number | null;
  balance?: number;
  trades?: number;
  error?: string;
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
  bot_name?: string;
  status?: BotStatus;
  message?: string;
  servers?: RemoteServer[];
  server?: RemoteServer;
  name?: string;
}

export interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void;
  isConnected: boolean;
  remoteServers: RemoteServer[];
  lastMessage: WebSocketMessage | null;
  botStatuses: Record<string, BotStatus>;
  reconnect: () => void;
}

export interface RemoteServer {
  name: string;
  host: string;
  status: RemoteServerStatus;
  lastSync: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children,
  url = 'ws://localhost:8000/api/ws'
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteServers, setRemoteServers] = useState<RemoteServer[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [botStatuses, setBotStatuses] = useState<Record<string, BotStatus>>({});
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const connect = useCallback(() => {
    const websocket = new WebSocket(url);

    websocket.onopen = () => {
      setIsConnected(true);
      setReconnectAttempt(0);
      // Запрашиваем список серверов при подключении
      websocket.send(JSON.stringify({ type: 'get_remotes' }));
    };

    websocket.onclose = () => {
      setIsConnected(false);
      // Пробуем переподключиться через 5 секунд
      setTimeout(() => {
        setReconnectAttempt(prev => prev + 1);
      }, 5000);
    };

    websocket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    websocket.onmessage = (event: MessageEvent) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(data);
        
        switch (data.type) {
          case 'bot_status':
            if (data.bot_name && data.status) {
              const botName = data.bot_name;
              const botStatus = data.status;
              setBotStatuses(prev => ({
                ...prev,
                [botName]: botStatus
              }));
            }
            break;
            
          case 'remotes_list':
            if (data.servers) {
              setRemoteServers(data.servers);
            }
            break;
            
          case 'remote_added':
            if (data.server) {
              setRemoteServers(prev => [...prev, data.server!]);
            }
            break;
            
          case 'remote_deleted':
            if (data.name) {
              setRemoteServers(prev => 
                prev.filter(server => server.name !== data.name)
              );
            }
            break;
            
          case 'remote_synced':
            if (data.server) {
              setRemoteServers(prev => 
                prev.map(server => 
                  server.name === data.server!.name ? data.server! : server
                )
              );
            }
            break;
            
          case 'remote_status':
            if (data.name && data.status) {
              const serverStatus = data.status as unknown as RemoteServerStatus;
              setRemoteServers(prev =>
                prev.map(server =>
                  server.name === data.name
                    ? { ...server, status: serverStatus }
                    : server
                )
              );
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setWs(websocket);

    return websocket;
  }, [url]);

  useEffect(() => {
    const websocket = connect();

    return () => {
      websocket.close();
    };
  }, [connect, reconnectAttempt]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  const reconnect = useCallback(() => {
    if (ws) {
      ws.close();
    }
    setReconnectAttempt(prev => prev + 1);
  }, [ws]);

  return (
    <WebSocketContext.Provider 
      value={{ 
        sendMessage, 
        isConnected, 
        remoteServers,
        lastMessage,
        botStatuses,
        reconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}; 