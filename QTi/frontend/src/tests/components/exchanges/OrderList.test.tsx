import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderList } from '../../../components/exchanges/OrderList';
import { exchangeService } from '../../../services/exchange';

// Mock the exchange service
jest.mock('../../../services/exchange');

describe('OrderList', () => {
    const mockOrders = [
        {
            id: '1',
            symbol: 'BTC/USDT',
            market_type: 'spot',
            side: 'buy',
            type: 'limit',
            price: 50000,
            qty: 1.0,
            filled_qty: 0.0,
            status: 'new',
            timestamp: Date.now()
        },
        {
            id: '2',
            symbol: 'BTC/USDT',
            market_type: 'spot',
            side: 'sell',
            type: 'market',
            price: null,
            qty: 0.5,
            filled_qty: 0.5,
            status: 'partially_filled',
            timestamp: Date.now()
        }
    ];

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementations
        (exchangeService.getOpenOrders as jest.Mock).mockResolvedValue(mockOrders);
        (exchangeService.createOrder as jest.Mock).mockResolvedValue({
            id: '3',
            symbol: 'BTC/USDT',
            market_type: 'spot',
            side: 'buy',
            type: 'limit',
            price: 49000,
            qty: 0.1,
            filled_qty: 0.0,
            status: 'new',
            timestamp: Date.now()
        });
        (exchangeService.cancelOrder as jest.Mock).mockResolvedValue({
            id: '1',
            symbol: 'BTC/USDT',
            market_type: 'spot',
            side: 'buy',
            type: 'limit',
            price: 50000,
            qty: 1.0,
            filled_qty: 0.0,
            status: 'canceled',
            timestamp: Date.now()
        });
    });

    it('renders loading state initially', () => {
        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders orders after loading', async () => {
        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Open Orders')).toBeInTheDocument();
        });

        // Check order details
        expect(screen.getByText('BTC/USDT')).toBeInTheDocument();
        expect(screen.getByText('LIMIT')).toBeInTheDocument();
        expect(screen.getByText('MARKET')).toBeInTheDocument();
        expect(screen.getByText('BUY')).toBeInTheDocument();
        expect(screen.getByText('SELL')).toBeInTheDocument();
        expect(screen.getByText('50000.00')).toBeInTheDocument();
        expect(screen.getByText('1.0000')).toBeInTheDocument();
        expect(screen.getByText('0.5000')).toBeInTheDocument();
        expect(screen.getByText('NEW')).toBeInTheDocument();
        expect(screen.getByText('PARTIALLY_FILLED')).toBeInTheDocument();
    });

    it('opens create order dialog when New Order button is clicked', async () => {
        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('New Order')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('New Order'));

        expect(screen.getByText('Create New Order')).toBeInTheDocument();
        expect(screen.getByLabelText('Side')).toBeInTheDocument();
        expect(screen.getByLabelText('Order Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('creates new order when form is submitted', async () => {
        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('New Order')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('New Order'));

        // Fill in the form
        fireEvent.change(screen.getByLabelText('Side'), { target: { value: 'buy' } });
        fireEvent.change(screen.getByLabelText('Order Type'), { target: { value: 'limit' } });
        fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0.1' } });
        fireEvent.change(screen.getByLabelText('Price'), { target: { value: '49000' } });

        fireEvent.click(screen.getByText('Create Order'));

        await waitFor(() => {
            expect(exchangeService.createOrder).toHaveBeenCalledWith('binance', {
                symbol: 'BTC/USDT',
                market_type: 'spot',
                side: 'buy',
                type: 'limit',
                quantity: 0.1,
                price: 49000
            });
        });
    });

    it('cancels order when Cancel button is clicked', async () => {
        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));

        await waitFor(() => {
            expect(exchangeService.cancelOrder).toHaveBeenCalledWith(
                'binance',
                'BTC/USDT',
                'spot',
                '1'
            );
        });
    });

    it('shows error message when loading fails', async () => {
        const error = new Error('Failed to load orders');
        (exchangeService.getOpenOrders as jest.Mock).mockRejectedValue(error);

        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
        });
    });

    it('shows error message when creating order fails', async () => {
        const error = new Error('Failed to create order');
        (exchangeService.createOrder as jest.Mock).mockRejectedValue(error);

        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('New Order')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('New Order'));

        // Fill in the form
        fireEvent.change(screen.getByLabelText('Side'), { target: { value: 'buy' } });
        fireEvent.change(screen.getByLabelText('Order Type'), { target: { value: 'limit' } });
        fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '0.1' } });
        fireEvent.change(screen.getByLabelText('Price'), { target: { value: '49000' } });

        fireEvent.click(screen.getByText('Create Order'));

        await waitFor(() => {
            expect(screen.getByText('Failed to create order')).toBeInTheDocument();
        });
    });

    it('shows error message when canceling order fails', async () => {
        const error = new Error('Failed to cancel order');
        (exchangeService.cancelOrder as jest.Mock).mockRejectedValue(error);

        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));

        await waitFor(() => {
            expect(screen.getByText('Failed to cancel order')).toBeInTheDocument();
        });
    });

    it('refreshes orders every 5 seconds', async () => {
        jest.useFakeTimers();

        render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        await waitFor(() => {
            expect(exchangeService.getOpenOrders).toHaveBeenCalledTimes(1);
        });

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        await waitFor(() => {
            expect(exchangeService.getOpenOrders).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });

    it('cleans up interval on unmount', () => {
        jest.useFakeTimers();

        const { unmount } = render(
            <OrderList
                exchange="binance"
                symbol="BTC/USDT"
                market_type="spot"
            />
        );

        unmount();

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);

        expect(exchangeService.getOpenOrders).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });
}); 