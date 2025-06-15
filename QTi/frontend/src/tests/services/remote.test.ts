import { remoteService } from '../../services/remote';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Remote Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Management', () => {
    const mockServer = {
      id: '1',
      name: 'Test Server',
      host: 'test.com',
      username: 'user',
      port: 22
    };

    it('gets servers', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockServer] });

      const result = await remoteService.getServers();
      expect(result).toEqual([mockServer]);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/remote/servers');
    });

    it('creates server', async () => {
      const newServer = {
        name: 'New Server',
        host: 'new.com',
        username: 'newuser',
        password: 'pass',
        port: 22
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { id: '2', ...newServer } });

      const result = await remoteService.createServer(newServer);
      expect(result).toEqual({ id: '2', ...newServer });
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/remote/servers', newServer);
    });

    it('updates server', async () => {
      const updatedServer = {
        ...mockServer,
        name: 'Updated Server'
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedServer });

      const result = await remoteService.updateServer('1', updatedServer);
      expect(result).toEqual(updatedServer);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/remote/servers/1', updatedServer);
    });

    it('deletes server', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await remoteService.deleteServer('1');
      expect(result).toEqual({ success: true });
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/remote/servers/1');
    });
  });

  describe('Bot Management', () => {
    const mockBot = {
      id: '1',
      name: 'Test Bot',
      status: 'stopped',
      config: {},
      lastUpdate: new Date().toISOString()
    };

    it('gets bots', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockBot] });

      const result = await remoteService.getBots('1');
      expect(result).toEqual([mockBot]);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/remote/servers/1/bots');
    });

    it('creates bot', async () => {
      const newBot = {
        name: 'New Bot',
        config: {}
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { id: '2', ...newBot, status: 'stopped' } });

      const result = await remoteService.createBot('1', newBot);
      expect(result).toEqual({ id: '2', ...newBot, status: 'stopped' });
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/remote/servers/1/bots', newBot);
    });

    it('updates bot', async () => {
      const updatedBot = {
        ...mockBot,
        name: 'Updated Bot'
      };

      mockedAxios.put.mockResolvedValueOnce({ data: updatedBot });

      const result = await remoteService.updateBot('1', '1', updatedBot);
      expect(result).toEqual(updatedBot);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/remote/servers/1/bots/1', updatedBot);
    });

    it('deletes bot', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await remoteService.deleteBot('1', '1');
      expect(result).toEqual({ success: true });
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/remote/servers/1/bots/1');
    });

    it('starts bot', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await remoteService.startBot('1', '1');
      expect(result).toEqual({ success: true });
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/remote/servers/1/bots/1/start');
    });

    it('stops bot', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await remoteService.stopBot('1', '1');
      expect(result).toEqual({ success: true });
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/remote/servers/1/bots/1/stop');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(remoteService.getServers()).rejects.toThrow('Network Error');
    });

    it('handles server errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      });

      await expect(remoteService.getServers()).rejects.toThrow('Internal Server Error');
    });

    it('handles validation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid input' }
        }
      });

      await expect(remoteService.createServer({} as any)).rejects.toThrow('Invalid input');
    });
  });
}); 