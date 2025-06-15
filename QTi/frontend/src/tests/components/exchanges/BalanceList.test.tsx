import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BalanceList } from '../../../components/exchanges/BalanceList';
import { exchangeService } from '../../../services/exchange';

// Mock the exchange service
jest.mock('../../../services/exchange');

describe('BalanceList', () => {
    const mockBalances = [
        {
            asset: 'BTC',
            free: 1.0,
            locked: 0.5
        },
        {
            asset: 'ETH',
            free: 10.0,
            locked: 2.0
        },
        {
            asset: 'USDT',
            free: 1000.0,
            locked: 100.0
        }
    ];

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementation
        (exchangeService.getBalance as jest.Mock).mockResolvedValue(mockBalances);
    });

    it('renders loading state initially', () => {
        render(
            <BalanceList
                exchange="binance"
            />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders balances after loading', async () => {
        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Balances')).toBeInTheDocument();
        });

        // Check balance details
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(screen.getByText('USDT')).toBeInTheDocument();
        expect(screen.getByText('1.00000000')).toBeInTheDocument();
        expect(screen.getByText('0.50000000')).toBeInTheDocument();
        expect(screen.getByText('10.00000000')).toBeInTheDocument();
        expect(screen.getByText('2.00000000')).toBeInTheDocument();
        expect(screen.getByText('1000.00000000')).toBeInTheDocument();
        expect(screen.getByText('100.00000000')).toBeInTheDocument();
    });

    it('shows error message when loading fails', async () => {
        const error = new Error('Failed to load balances');
        (exchangeService.getBalance as jest.Mock).mockRejectedValue(error);

        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load balances')).toBeInTheDocument();
        });
    });

    it('refreshes balances every 5 seconds', async () => {
        jest.useFakeTimers();

        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getBalance).toHaveBeenCalledTimes(1);
        });

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(exchangeService.getBalance).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });

    it('cleans up interval on unmount', () => {
        jest.useFakeTimers();

        const { unmount } = render(
            <BalanceList
                exchange="binance"
            />
        );

        unmount();

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        expect(exchangeService.getBalance).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });

    it('filters balances by asset when provided', async () => {
        render(
            <BalanceList
                exchange="binance"
                asset="BTC"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getBalance).toHaveBeenCalledWith('binance', 'BTC');
        });
    });

    it('filters balances by search query', async () => {
        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText('Search Asset')).toBeInTheDocument();
        });

        // Search for BTC
        fireEvent.change(screen.getByLabelText('Search Asset'), {
            target: { value: 'BTC' }
        });

        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.queryByText('ETH')).not.toBeInTheDocument();
        expect(screen.queryByText('USDT')).not.toBeInTheDocument();

        // Search for ETH
        fireEvent.change(screen.getByLabelText('Search Asset'), {
            target: { value: 'ETH' }
        });

        expect(screen.queryByText('BTC')).not.toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
        expect(screen.queryByText('USDT')).not.toBeInTheDocument();
    });

    it('calculates total balance correctly', async () => {
        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            // Check total for BTC (1.0 + 0.5 = 1.5)
            expect(screen.getByText('1.50000000')).toBeInTheDocument();
            // Check total for ETH (10.0 + 2.0 = 12.0)
            expect(screen.getByText('12.00000000')).toBeInTheDocument();
            // Check total for USDT (1000.0 + 100.0 = 1100.0)
            expect(screen.getByText('1100.00000000')).toBeInTheDocument();
        });
    });

    it('formats numbers with 8 decimal places', async () => {
        render(
            <BalanceList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('1.00000000')).toBeInTheDocument();
            expect(screen.getByText('0.50000000')).toBeInTheDocument();
            expect(screen.getByText('10.00000000')).toBeInTheDocument();
            expect(screen.getByText('2.00000000')).toBeInTheDocument();
            expect(screen.getByText('1000.00000000')).toBeInTheDocument();
            expect(screen.getByText('100.00000000')).toBeInTheDocument();
        });
    });
}); 