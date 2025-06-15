import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bot, BacktestResult, OptimizationResult, MonitorStatus } from '../types';
import { apiClient } from '../api/client';

interface AppContextType {
  bots: Bot[];
  backtests: BacktestResult[];
  optimizations: OptimizationResult[];
  monitoring: MonitorStatus[];
  loading: boolean;
  error: string | null;
  fetchBots: () => Promise<void>;
  fetchBacktests: () => Promise<void>;
  fetchOptimizations: () => Promise<void>;
  fetchMonitoring: () => Promise<void>;
  createBot: (data: any) => Promise<void>;
  updateBot: (id: string, data: any) => Promise<void>;
  deleteBot: (id: string) => Promise<void>;
  startBacktest: (data: any) => Promise<void>;
  startOptimization: (data: any) => Promise<void>;
  stopOptimization: (id: string) => Promise<void>;
  startMonitoring: (data: any) => Promise<void>;
  stopMonitoring: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [monitoring, setMonitoring] = useState<MonitorStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBots();
      setBots(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bots');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBacktests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getBacktestResults('');
      setBacktests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch backtests');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptimizations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOptimizationResults('');
      setOptimizations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch optimizations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonitoring = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMonitoringStatus('');
      setMonitoring(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring status');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBot = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await apiClient.createBot(data);
      await fetchBots();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bot');
    } finally {
      setLoading(false);
    }
  }, [fetchBots]);

  const updateBot = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      await apiClient.updateBot(id, data);
      await fetchBots();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bot');
    } finally {
      setLoading(false);
    }
  }, [fetchBots]);

  const deleteBot = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await apiClient.deleteBot(id);
      await fetchBots();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bot');
    } finally {
      setLoading(false);
    }
  }, [fetchBots]);

  const startBacktest = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await apiClient.startBacktest(data);
      await fetchBacktests();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start backtest');
    } finally {
      setLoading(false);
    }
  }, [fetchBacktests]);

  const startOptimization = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await apiClient.startOptimization(data);
      await fetchOptimizations();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start optimization');
    } finally {
      setLoading(false);
    }
  }, [fetchOptimizations]);

  const stopOptimization = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await apiClient.stopOptimization(id);
      await fetchOptimizations();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop optimization');
    } finally {
      setLoading(false);
    }
  }, [fetchOptimizations]);

  const startMonitoring = useCallback(async (data: any) => {
    try {
      setLoading(true);
      await apiClient.startMonitoring(data);
      await fetchMonitoring();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  }, [fetchMonitoring]);

  const stopMonitoring = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await apiClient.stopMonitoring(id);
      await fetchMonitoring();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  }, [fetchMonitoring]);

  const value = {
    bots,
    backtests,
    optimizations,
    monitoring,
    loading,
    error,
    fetchBots,
    fetchBacktests,
    fetchOptimizations,
    fetchMonitoring,
    createBot,
    updateBot,
    deleteBot,
    startBacktest,
    startOptimization,
    stopOptimization,
    startMonitoring,
    stopMonitoring,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 