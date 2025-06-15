import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServerList } from '../../../components/remote/ServerList';
import { remoteService } from '../../../services/remote';
import { SnackbarProvider } from 'notistack';

jest.mock('../../../services/remote', () => ({
  remoteService: {
    getServers: jest.fn(),
    createServer: jest.fn(),
    updateServer: jest.fn(),
    deleteServer: jest.fn()
  }
}));

describe('ServerList Component', () => {
  const mockServers = [
    {
      id: '1',
      name: 'Test Server',
      host: 'test.com',
      username: 'user',
      port: 22
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (remoteService.getServers as jest.Mock).mockResolvedValue(mockServers);
  });

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

  it('opens add server dialog', async () => {
    render(
      <SnackbarProvider>
        <ServerList onServerSelect={jest.fn()} />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Server'));

    await waitFor(() => {
      expect(screen.getByText('Add New Server')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Host')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Port')).toBeInTheDocument();
    });
  });

  it('creates new server', async () => {
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
      expect(screen.getByText('New Server')).toBeInTheDocument();
    });
  });

  it('handles server deletion', async () => {
    (remoteService.deleteServer as jest.Mock).mockResolvedValue({ success: true });

    render(
      <SnackbarProvider>
        <ServerList onServerSelect={jest.fn()} />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-server-1'));
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(remoteService.deleteServer).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Test Server')).not.toBeInTheDocument();
    });
  });

  it('handles server update', async () => {
    const updatedServer = {
      ...mockServers[0],
      name: 'Updated Server'
    };

    (remoteService.updateServer as jest.Mock).mockResolvedValue(updatedServer);

    render(
      <SnackbarProvider>
        <ServerList onServerSelect={jest.fn()} />
      </SnackbarProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('edit-server-1'));
    });

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Updated Server' }
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(remoteService.updateServer).toHaveBeenCalledWith('1', updatedServer);
      expect(screen.getByText('Updated Server')).toBeInTheDocument();
    });
  });

  it('handles error when creating server', async () => {
    (remoteService.createServer as jest.Mock).mockRejectedValue(new Error('Failed to create server'));

    render(
      <SnackbarProvider>
        <ServerList onServerSelect={jest.fn()} />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Server'));

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Name'), {
        target: { value: 'New Server' }
      });
      fireEvent.change(screen.getByLabelText('Host'), {
        target: { value: 'new.com' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'user' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'pass' }
      });
      fireEvent.change(screen.getByLabelText('Port'), {
        target: { value: 22 }
      });
    });

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create server')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <SnackbarProvider>
        <ServerList onServerSelect={jest.fn()} />
      </SnackbarProvider>
    );

    fireEvent.click(screen.getByText('Add Server'));

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Host is required')).toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
}); 