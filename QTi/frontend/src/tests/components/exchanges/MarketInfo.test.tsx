import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MarketInfo } from '../../../components/exchanges/MarketInfo';
import { exchangeService } from '../../../services/exchange';

// Mock the exchange service
jest.mock('../../../services/exchange');

describe('MarketInfo', () => {
    const mockMarketInfo = {
        symbol: 'BTC/USDT',
        base_asset: 'BTC',
        quote_asset: 'USDT',
        min_price: 0.01,
        max_price: 1000000,
        min_qty: 0.0001,
        max_qty: 1000,
        min_notional: 10,
        price_precision: 2,
        qty_precision: 4
    };

    const mockOrderBook = {
        symbol: 'BTC/USDT',
        bids: [[50000, 1.0], [49900, 2.0]],
        asks: [[50100, 1.0], [50200, 2.0]],
        timestamp: Date.now()
    };

    const mockTrades = [
        {
            id: '1',
            symbol: 'BTC/USDT',
            side: 'buy',
            price: 50000,
            qty: 1.0,
            timestamp: Date.now()
        },
        {
            id: '2',
            symbol: 'BTC/USDT',
            side: 'sell',
            price: 49900,
            qty: 0.5,
            timestamp: Date.now()
        }
    ];

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementations
        (exchangeService.getMarkets as jest.Mock).mockResolvedValue([mockMarketInfo]);
        (exchangeService.getOrderBook as jest.Mock).mockResolvedValue(mockOrderBook);
        (exchangeService.getTrades as jest.Mock).mockResolvedValue(mockTrades);
    });

    it('renders loading state initially', () => {
        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders market information after loading', async () => {
        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Market Information')).toBeInTheDocument();
        });

        expect(screen.getByText('Symbol: BTC/USDT')).toBeInTheDocument();
        expect(screen.getByText('Base Asset: BTC')).toBeInTheDocument();
        expect(screen.getByText('Quote Asset: USDT')).toBeInTheDocument();
        expect(screen.getByText('Min Price: 0.01')).toBeInTheDocument();
        expect(screen.getByText('Max Price: 1000000')).toBeInTheDocument();
    });

    it('renders order book after loading', async () => {
        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Order Book')).toBeInTheDocument();
        });

        // Check asks (in reverse order)
        expect(screen.getByText('50200.00')).toBeInTheDocument();
        expect(screen.getByText('50100.00')).toBeInTheDocument();

        // Check bids
        expect(screen.getByText('50000.00')).toBeInTheDocument();
        expect(screen.getByText('49900.00')).toBeInTheDocument();
    });

    it('renders recent trades after loading', async () => {
        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Recent Trades')).toBeInTheDocument();
        });

        // Check trade details
        expect(screen.getByText('50000.00')).toBeInTheDocument();
        expect(screen.getByText('49900.00')).toBeInTheDocument();
        expect(screen.getByText('BUY')).toBeInTheDocument();
        expect(screen.getByText('SELL')).toBeInTheDocument();
    });

    it('shows error message when loading fails', async () => {
        const error = new Error('Failed to load market data');
        (exchangeService.getMarkets as jest.Mock).mockRejectedValue(error);

        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load market data')).toBeInTheDocument();
        });
    });

    it('refreshes data every 5 seconds', async () => {
        jest.useFakeTimers();

        render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getMarkets).toHaveBeenCalledTimes(1);
            expect(exchangeService.getOrderBook).toHaveBeenCalledTimes(1);
            expect(exchangeService.getTrades).toHaveBeenCalledTimes(1);
        });

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(exchangeService.getMarkets).toHaveBeenCalledTimes(2);
            expect(exchangeService.getOrderBook).toHaveBeenCalledTimes(2);
            expect(exchangeService.getTrades).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });

    it('cleans up interval on unmount', () => {
        jest.useFakeTimers();

        const { unmount } = render(
            <MarketInfo
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        unmount();

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        expect(exchangeService.getMarkets).toHaveBeenCalledTimes(1);
        expect(exchangeService.getOrderBook).toHaveBeenCalledTimes(1);
        expect(exchangeService.getTrades).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });
}); 