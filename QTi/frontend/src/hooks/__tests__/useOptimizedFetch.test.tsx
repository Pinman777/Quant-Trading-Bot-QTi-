import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useOptimizedFetch } from '../useOptimizedFetch';
import { cacheService } from '../../services/cache';

// Mock cache service
jest.mock('../../services/cache', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('useOptimizedFetch', () => {
  const mockFetchFn = jest.fn();
  const mockData = { test: 'data' };
  const mockKey = 'test-key';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch data and cache it', async () => {
    mockFetchFn.mockResolvedValueOnce(mockData);
    (cacheService.get as jest.Mock).mockResolvedValueOnce(null);

    const { result, waitForNextUpdate } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
      })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(cacheService.set).toHaveBeenCalledWith(
      'marketData',
      mockKey,
      mockData,
      5
    );
  });

  it('should use cached data when available', async () => {
    (cacheService.get as jest.Mock).mockResolvedValueOnce(mockData);

    const { result, waitForNextUpdate } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
      })
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual(mockData);
    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Fetch failed');
    mockFetchFn.mockRejectedValueOnce(mockError);
    (cacheService.get as jest.Mock).mockResolvedValueOnce(null);

    const { result, waitForNextUpdate } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
      })
    );

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('should debounce fetch calls', async () => {
    mockFetchFn.mockResolvedValueOnce(mockData);
    (cacheService.get as jest.Mock).mockResolvedValueOnce(null);

    const { result, waitForNextUpdate } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
        debounceMs: 300,
      })
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitForNextUpdate();

    expect(mockFetchFn).toHaveBeenCalledTimes(1);
  });

  it('should force refresh when refresh is called', async () => {
    (cacheService.get as jest.Mock).mockResolvedValueOnce(mockData);
    mockFetchFn.mockResolvedValueOnce({ test: 'new data' });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
      })
    );

    await waitForNextUpdate();

    // Initial data from cache
    expect(result.current.data).toEqual(mockData);

    // Force refresh
    act(() => {
      result.current.refresh();
    });

    await waitForNextUpdate();

    // Should have new data
    expect(result.current.data).toEqual({ test: 'new data' });
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useOptimizedFetch({
        key: mockKey,
        storeName: 'marketData',
        fetchFn: mockFetchFn,
        enabled: false,
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockFetchFn).not.toHaveBeenCalled();
  });
}); 