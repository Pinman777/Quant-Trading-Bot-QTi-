import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BotList } from '../../../components/remote/BotList';
import { remoteService } from '../../../services/remote';
import { SnackbarProvider } from 'notistack';

jest.mock('../../../services/remote', () => ({
  remoteService: {
    getBots: jest.fn(),
    createBot: jest.fn(),
    updateBot: jest.fn(),
    deleteBot: jest.fn(),
    startBot: jest.fn(),
    stopBot: jest.fn()
  }
}));

describe('BotList Component', () => {
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
    (remoteService.getBots as jest.Mock).mockResolvedValue(mockBots);
  });

  it('renders bot list correctly', async () => {
    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('QTi Bots')).toBeInTheDocument();
      expect(screen.getByText('Test Bot')).toBeInTheDocument();
      expect(screen.getByText('Stopped')).toBeInTheDocument();
    });
  });

  it('handles bot start', async () => {
    (remoteService.startBot as jest.Mock).mockResolvedValue({ success: true });
    (remoteService.getBots as jest.Mock).mockResolvedValue([
      { ...mockBots[0], status: 'running' }
    ]);

    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('start-bot-1'));
    });

    await waitFor(() => {
      expect(remoteService.startBot).toHaveBeenCalledWith('1', '1');
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  it('handles bot stop', async () => {
    (remoteService.stopBot as jest.Mock).mockResolvedValue({ success: true });
    (remoteService.getBots as jest.Mock).mockResolvedValue([
      { ...mockBots[0], status: 'stopped' }
    ]);

    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('stop-bot-1'));
    });

    await waitFor(() => {
      expect(remoteService.stopBot).toHaveBeenCalledWith('1', '1');
      expect(screen.getByText('Stopped')).toBeInTheDocument();
    });
  });

  it('opens add bot dialog', async () => {
    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Bot'));

    await waitFor(() => {
      expect(screen.getByText('Add New Bot')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Configuration')).toBeInTheDocument();
    });
  });

  it('creates new bot', async () => {
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
      expect(screen.getByText('New Bot')).toBeInTheDocument();
    });
  });

  it('handles bot deletion', async () => {
    (remoteService.deleteBot as jest.Mock).mockResolvedValue({ success: true });

    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-bot-1'));
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(remoteService.deleteBot).toHaveBeenCalledWith('1', '1');
      expect(screen.queryByText('Test Bot')).not.toBeInTheDocument();
    });
  });

  it('handles bot update', async () => {
    const updatedBot = {
      ...mockBots[0],
      name: 'Updated Bot'
    };

    (remoteService.updateBot as jest.Mock).mockResolvedValue(updatedBot);

    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('edit-bot-1'));
    });

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Updated Bot' }
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(remoteService.updateBot).toHaveBeenCalledWith('1', '1', updatedBot);
      expect(screen.getByText('Updated Bot')).toBeInTheDocument();
    });
  });

  it('handles error when creating bot', async () => {
    (remoteService.createBot as jest.Mock).mockRejectedValue(new Error('Failed to create bot'));

    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Bot'));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'New Bot' }
      });
      fireEvent.change(screen.getByLabelText('Configuration'), {
        target: { value: '{}' }
      });
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create bot')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Bot'));

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Configuration is required')).toBeInTheDocument();
    });
  });

  it('validates JSON configuration', async () => {
    render(
      <SnackbarProvider>
        <BotList serverId="1" />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Bot'));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'New Bot' }
      });
      fireEvent.change(screen.getByLabelText('Configuration'), {
        target: { value: 'invalid json' }
      });
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON configuration')).toBeInTheDocument();
    });
  });
}); 