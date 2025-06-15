import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServerList } from '../../components/remote/ServerList';
import { BotList } from '../../components/remote/BotList';
import { remoteService } from '../../services/remote';
import { SnackbarProvider } from 'notistack';

// Мок для remoteService
jest.mock('../../services/remote', () => ({
  remoteService: {
    getServers: jest.fn(),
    createServer: jest.fn(),
    updateServer: jest.fn(),
    deleteServer: jest.fn(),
    getBots: jest.fn(),
    createBot: jest.fn(),
    updateBot: jest.fn(),
    deleteBot: jest.fn(),
    startBot: jest.fn(),
    stopBot: jest.fn()
  }
}));

describe('Remote Components Integration', () => {
  const mockServers = [
    {
      id: '1',
      name: 'Test Server',
      host: 'test.com',
      username: 'user',
      port: 22
    }
  ];

  const mockBots = [
    {
      id: '1',
      name: 'Test Bot',
      status: 'stopped',
      config: {},
      lastUpdate: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (remoteService.getServers as jest.Mock).mockResolvedValue(mockServers);
    (remoteService.getBots as jest.Mock).mockResolvedValue(mockBots);
  });

  describe('ServerList', () => {
    it('renders server list correctly', async () => {
      render(
        <SnackbarProvider>
          <ServerList onServerSelect={jest.fn()} />
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('QTi Remote Servers')).toBeInTheDocument();
        expect(screen.getByText('Test Server')).toBeInTheDocument();
      });
    });

    it('handles server selection', async () => {
      const onServerSelect = jest.fn();
      render(
        <SnackbarProvider>
          <ServerList onServerSelect={onServerSelect} />
        </SnackbarProvider>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByText('Test Server'));
        expect(onServerSelect).toHaveBeenCalledWith(mockServers[0]);
      });
    });

    it('handles server creation', async () => {
      const newServer = {
        name: 'New Server',
        host: 'new.com',
        username: 'newuser',
        password: 'pass',
        port: 22
      };

      (remoteService.createServer as jest.Mock).mockResolvedValue({
        id: '2',
        ...newServer
      });

      render(
        <SnackbarProvider>
          <ServerList onServerSelect={jest.fn()} />
        </SnackbarProvider>
      );

      fireEvent.click(screen.getByText('Add Server'));

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: newServer.name }
        });
        fireEvent.change(screen.getByLabelText('Host'), {
          target: { value: newServer.host }
        });
        fireEvent.change(screen.getByLabelText('Username'), {
          target: { value: newServer.username }
        });
        fireEvent.change(screen.getByLabelText('Password'), {
          target: { value: newServer.password }
        });
        fireEvent.change(screen.getByLabelText('Port'), {
          target: { value: newServer.port }
        });
      });

      fireEvent.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(remoteService.createServer).toHaveBeenCalledWith(newServer);
      });
    });
  });

  describe('BotList', () => {
    it('renders bot list correctly', async () => {
      render(
        <SnackbarProvider>
          <BotList serverId="1" />
        </SnackbarProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('QTi Bots')).toBeInTheDocument();
        expect(screen.getByText('Test Bot')).toBeInTheDocument();
      });
    });

    it('handles bot start/stop', async () => {
      render(
        <SnackbarProvider>
          <BotList serverId="1" />
        </SnackbarProvider>
      );

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('start-bot-1'));
        expect(remoteService.startBot).toHaveBeenCalledWith('1', '1');
      });

      (remoteService.getBots as jest.Mock).mockResolvedValue([
        { ...mockBots[0], status: 'running' }
      ]);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('stop-bot-1'));
        expect(remoteService.stopBot).toHaveBeenCalledWith('1', '1');
      });
    });

    it('handles bot creation', async () => {
      const newBot = {
        name: 'New Bot',
        config: {}
      };

      (remoteService.createBot as jest.Mock).mockResolvedValue({
        id: '2',
        ...newBot,
        status: 'stopped',
        lastUpdate: new Date().toISOString()
      });

      render(
        <SnackbarProvider>
          <BotList serverId="1" />
        </SnackbarProvider>
      );

      fireEvent.click(screen.getByText('Add Bot'));

      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('Name'), {
          target: { value: newBot.name }
        });
        fireEvent.change(screen.getByLabelText('Configuration'), {
          target: { value: JSON.stringify(newBot.config) }
        });
      });

      fireEvent.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(remoteService.createBot).toHaveBeenCalledWith('1', {
          ...newBot,
          config: {}
        });
      });
    });
  });
}); 