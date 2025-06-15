import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PositionList } from '../../../components/exchanges/PositionList';
import { exchangeService } from '../../../services/exchange';

// Mock the exchange service
jest.mock('../../../services/exchange');

describe('PositionList', () => {
    const mockPositions = [
        {
            symbol: 'BTC/USDT',
            side: 'long',
            entry_price: 50000,
            mark_price: 51000,
            qty: 1.0,
            leverage: 10,
            margin_type: 'isolated',
            liquidation_price: 45000,
            unrealized_pnl: 1000,
            realized_pnl: 0
        },
        {
            symbol: 'ETH/USDT',
            side: 'short',
            entry_price: 3000,
            mark_price: 2900,
            qty: 5.0,
            leverage: 5,
            margin_type: 'cross',
            liquidation_price: 3500,
            unrealized_pnl: -500,
            realized_pnl: 200
        }
    ];

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementation
        (exchangeService.getPositions as jest.Mock).mockResolvedValue(mockPositions);
    });

    it('renders loading state initially', () => {
        render(
            <PositionList
                exchange="binance"
            />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders positions after loading', async () => {
        render(
            <PositionList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Positions')).toBeInTheDocument();
        });

        // Check position details
        expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
        expect(screen.getByText('ETH/USDT')).toBeInTheDocument();
        expect(screen.getByText('LONG')).toBeInTheDocument();
        expect(screen.getByText('SHORT')).toBeInTheDocument();
        expect(screen.getByText('50000.00')).toBeInTheDocument();
        expect(screen.getByText('51000.00')).toBeInTheDocument();
        expect(screen.getByText('1.0000')).toBeInTheDocument();
        expect(screen.getByText('5.0000')).toBeInTheDocument();
        expect(screen.getByText('10x')).toBeInTheDocument();
        expect(screen.getByText('5x')).toBeInTheDocument();
        expect(screen.getByText('ISOLATED')).toBeInTheDocument();
        expect(screen.getByText('CROSS')).toBeInTheDocument();
        expect(screen.getByText('45000.00')).toBeInTheDocument();
        expect(screen.getByText('3500.00')).toBeInTheDocument();
    });

    it('shows error message when loading fails', async () => {
        const error = new Error('Failed to load positions');
        (exchangeService.getPositions as jest.Mock).mockRejectedValue(error);

        render(
            <PositionList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load positions')).toBeInTheDocument();
        });
    });

    it('refreshes positions every 5 seconds', async () => {
        jest.useFakeTimers();

        render(
            <PositionList
                exchange="binance"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getPositions).toHaveBeenCalledTimes(1);
        });

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(exchangeService.getPositions).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });

    it('cleans up interval on unmount', () => {
        jest.useFakeTimers();

        const { unmount } = render(
            <PositionList
                exchange="binance"
            />
        );

        unmount();

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        expect(exchangeService.getPositions).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });

    it('filters positions by symbol when provided', async () => {
        render(
            <PositionList
                exchange="binance"
                symbol="BTC/USDT"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getPositions).toHaveBeenCalledWith('binance', 'BTC/USDT');
        });
    });

    it('shows correct PnL indicators', async () => {
        render(
            <PositionList
                exchange="binance"
            />
        );

        await waitFor(() => {
            // Check for trending up icon for positive PnL
            expect(screen.getAllByTestId('TrendingUpIcon')[0]).toBeInTheDocument();
            // Check for trending down icon for negative PnL
            expect(screen.getAllByTestId('TrendingDownIcon')[0]).toBeInTheDocument();
        });
    });

    it('formats numbers correctly', async () => {
        render(
            <PositionList
                exchange="binance"
            />
        );

        await waitFor(() => {
            // Check price formatting
            expect(screen.getByText('50000.00')).toBeInTheDocument();
            expect(screen.getByText('51000.00')).toBeInTheDocument();
            // Check quantity formatting
            expect(screen.getByText('1.0000')).toBeInTheDocument();
            expect(screen.getByText('5.0000')).toBeInTheDocument();
            // Check PnL formatting
            expect(screen.getByText('1000.00')).toBeInTheDocument();
            expect(screen.getByText('-500.00')).toBeInTheDocument();
        });
    });
}); 