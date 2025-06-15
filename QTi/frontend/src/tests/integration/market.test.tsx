import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalMetrics } from '../../components/market/GlobalMetrics';
import { CryptocurrencyList } from '../../components/market/CryptocurrencyList';
import { CryptocurrencyDetails } from '../../components/market/CryptocurrencyDetails';
import { coinmarketcapService } from '../../services/coinmarketcap';
import { cacheService } from '../../services/cache';

// Mock services
jest.mock('../../services/coinmarketcap', () => ({
  coinmarketcapService: {
    getGlobalMetrics: jest.fn(),
    getCryptocurrencies: jest.fn(),
    getCryptocurrencyDetails: jest.fn(),
    getHistoricalData: jest.fn(),
  },
}));

jest.mock('../../services/cache', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('Market Integration', () => {
  const mockGlobalMetrics = {
    total_market_cap: 2000000000000,
    total_volume_24h: 100000000000,
    btc_dominance: 40,
    eth_dominance: 20,
    active_cryptocurrencies: 5000,
  };

  const mockCryptocurrencies = [
    {
      id: 1,
      name: 'Bitcoin',
      symbol: 'BTC',
      price: 50000,
      percent_change_24h: 5,
      market_cap: 1000000000000,
      volume_24h: 50000000000,
    },
    {
      id: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3000,
      percent_change_24h: -2,
      market_cap: 300000000000,
      volume_24h: 20000000000,
    },
  ];

  const mockCryptocurrencyDetails = {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 50000,
    percent_change_24h: 5,
    percent_change_7d: 10,
    market_cap: 1000000000000,
    volume_24h: 50000000000,
    circulating_supply: 19000000,
    total_supply: 21000000,
    max_supply: 21000000,
    tags: ['mineable', 'store-of-value'],
    last_updated: '2024-01-01T00:00:00Z',
  };

  const mockHistoricalData = [
    { timestamp: '2024-01-01T00:00:00Z', price: 49000, volume: 45000000000 },
    { timestamp: '2024-01-01T01:00:00Z', price: 49500, volume: 46000000000 },
    { timestamp: '2024-01-01T02:00:00Z', price: 50000, volume: 50000000000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Global Metrics', () => {
    it('should load and display global metrics', async () => {
      (coinmarketcapService.getGlobalMetrics as jest.Mock).mockResolvedValueOnce(mockGlobalMetrics);

      render(<GlobalMetrics />);

      // Check loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for metrics to load
      await waitFor(() => {
        expect(screen.getByText('$2.00T')).toBeInTheDocument(); // Total Market Cap
        expect(screen.getByText('$100.00B')).toBeInTheDocument(); // 24h Volume
        expect(screen.getByText('40.00%')).toBeInTheDocument(); // BTC Dominance
        expect(screen.getByText('20.00%')).toBeInTheDocument(); // ETH Dominance
        expect(screen.getByText('5,000')).toBeInTheDocument(); // Active Cryptocurrencies
      });
    });

    it('should use cached data when available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValueOnce(mockGlobalMetrics);

      render(<GlobalMetrics />);

      // Wait for cached data to load
      await waitFor(() => {
        expect(screen.getByText('$2.00T')).toBeInTheDocument();
      });

      // Should not call API
      expect(coinmarketcapService.getGlobalMetrics).not.toHaveBeenCalled();
    });
  });

  describe('Cryptocurrency List', () => {
    it('should load and display cryptocurrencies', async () => {
      (coinmarketcapService.getCryptocurrencies as jest.Mock).mockResolvedValueOnce(mockCryptocurrencies);

      render(<CryptocurrencyList />);

      // Check loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for cryptocurrencies to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
      });

      // Check cryptocurrency details
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
      expect(screen.getByText('-2.00%')).toBeInTheDocument();
    });

    it('should handle search', async () => {
      (coinmarketcapService.getCryptocurrencies as jest.Mock).mockResolvedValueOnce(mockCryptocurrencies);

      render(<CryptocurrencyList />);

      // Wait for cryptocurrencies to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      });

      // Search for Bitcoin
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Bitcoin' },
      });

      // Check filtered results
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
    });

    it('should handle sorting', async () => {
      (coinmarketcapService.getCryptocurrencies as jest.Mock).mockResolvedValueOnce(mockCryptocurrencies);

      render(<CryptocurrencyList />);

      // Wait for cryptocurrencies to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      });

      // Sort by price
      fireEvent.click(screen.getByText('Price'));

      // Check sorted order
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Bitcoin');
      expect(rows[2]).toHaveTextContent('Ethereum');
    });
  });

  describe('Cryptocurrency Details', () => {
    it('should load and display cryptocurrency details', async () => {
      (coinmarketcapService.getCryptocurrencyDetails as jest.Mock).mockResolvedValueOnce(mockCryptocurrencyDetails);
      (coinmarketcapService.getHistoricalData as jest.Mock).mockResolvedValueOnce(mockHistoricalData);

      render(<CryptocurrencyDetails cryptocurrency={mockCryptocurrencyDetails} />);

      // Check loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for details to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('$50,000.00')).toBeInTheDocument();
      });

      // Check price changes
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
      expect(screen.getByText('+10.00%')).toBeInTheDocument();

      // Check market data
      expect(screen.getByText('$1.00T')).toBeInTheDocument(); // Market Cap
      expect(screen.getByText('$50.00B')).toBeInTheDocument(); // 24h Volume
      expect(screen.getByText('19,000,000')).toBeInTheDocument(); // Circulating Supply
      expect(screen.getByText('21,000,000')).toBeInTheDocument(); // Total Supply

      // Check tags
      expect(screen.getByText('mineable')).toBeInTheDocument();
      expect(screen.getByText('store-of-value')).toBeInTheDocument();
    });

    it('should handle timeframe changes', async () => {
      (coinmarketcapService.getCryptocurrencyDetails as jest.Mock).mockResolvedValueOnce(mockCryptocurrencyDetails);
      (coinmarketcapService.getHistoricalData as jest.Mock)
        .mockResolvedValueOnce(mockHistoricalData)
        .mockResolvedValueOnce([...mockHistoricalData, { timestamp: '2024-01-01T03:00:00Z', price: 50500, volume: 51000000000 }]);

      render(<CryptocurrencyDetails cryptocurrency={mockCryptocurrencyDetails} />);

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      });

      // Change timeframe
      fireEvent.click(screen.getByText('4H'));

      // Wait for new data to load
      await waitFor(() => {
        expect(coinmarketcapService.getHistoricalData).toHaveBeenCalledTimes(2);
      });
    });

    it('should use cached data when available', async () => {
      (cacheService.get as jest.Mock)
        .mockResolvedValueOnce(mockCryptocurrencyDetails)
        .mockResolvedValueOnce(mockHistoricalData);

      render(<CryptocurrencyDetails cryptocurrency={mockCryptocurrencyDetails} />);

      // Wait for cached data to load
      await waitFor(() => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      });

      // Should not call API
      expect(coinmarketcapService.getCryptocurrencyDetails).not.toHaveBeenCalled();
      expect(coinmarketcapService.getHistoricalData).not.toHaveBeenCalled();
    });
  });
}); 