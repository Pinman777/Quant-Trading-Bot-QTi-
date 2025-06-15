import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExchangeManager } from '../../../components/exchanges/ExchangeManager';
import { exchangeService } from '../../../services/exchange';

// Mock the exchange service
jest.mock('../../../services/exchange');

describe('ExchangeManager', () => {
    const mockExchanges = [
        {
            name: 'binance',
            supported_markets: ['spot', 'futures'],
            has_testnet: true,
            max_leverage: 125,
            min_order_size: 0.0001,
            trading_fees: {
                maker: 0.001,
                taker: 0.001
            },
            supported_timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
            supported_order_types: ['limit', 'market', 'stop', 'stop_limit']
        }
    ];

    const mockConfig = {
        api_key: 'test_key',
        api_secret: 'test_secret',
        testnet: false
    };

    const mockStatus = {
        is_connected: true,
        last_update: Date.now()
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock implementations
        (exchangeService.getSupportedExchanges as jest.Mock).mockResolvedValue(mockExchanges);
        (exchangeService.getExchangeConfig as jest.Mock).mockResolvedValue(mockConfig);
        (exchangeService.getExchangeStatus as jest.Mock).mockResolvedValue(mockStatus);
        (exchangeService.testConnection as jest.Mock).mockResolvedValue({ is_connected: true });
        (exchangeService.updateExchangeConfig as jest.Mock).mockResolvedValue(mockConfig);
    });

    it('renders loading state initially', () => {
        render(<ExchangeManager />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders exchanges after loading', async () => {
        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('BINANCE')).toBeInTheDocument();
        });

        expect(screen.getByText('Supported Markets: spot, futures')).toBeInTheDocument();
        expect(screen.getByText('Max Leverage: 125x')).toBeInTheDocument();
        expect(screen.getByText('Min Order Size: 0.0001')).toBeInTheDocument();
        expect(screen.getByText('Trading Fees: 0.1% maker / 0.1% taker')).toBeInTheDocument();
    });

    it('shows error message when loading fails', async () => {
        const error = new Error('Failed to load exchanges');
        (exchangeService.getSupportedExchanges as jest.Mock).mockRejectedValue(error);

        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load exchanges')).toBeInTheDocument();
        });
    });

    it('opens configuration dialog when Configure button is clicked', async () => {
        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Configure')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Configure'));

        expect(screen.getByText('Configure BINANCE')).toBeInTheDocument();
        expect(screen.getByLabelText('API Key')).toBeInTheDocument();
        expect(screen.getByLabelText('API Secret')).toBeInTheDocument();
        expect(screen.getByLabelText('Use Testnet')).toBeInTheDocument();
    });

    it('updates configuration when Save button is clicked', async () => {
        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Configure')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Configure'));

        const apiKeyInput = screen.getByLabelText('API Key');
        const apiSecretInput = screen.getByLabelText('API Secret');
        const testnetSwitch = screen.getByLabelText('Use Testnet');

        fireEvent.change(apiKeyInput, { target: { value: 'new_key' } });
        fireEvent.change(apiSecretInput, { target: { value: 'new_secret' } });
        fireEvent.click(testnetSwitch);

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(exchangeService.testConnection).toHaveBeenCalledWith('binance', {
                api_key: 'new_key',
                api_secret: 'new_secret',
                testnet: true
            });
            expect(exchangeService.updateExchangeConfig).toHaveBeenCalledWith('binance', {
                api_key: 'new_key',
                api_secret: 'new_secret',
                testnet: true
            });
        });
    });

    it('shows error message when connection test fails', async () => {
        (exchangeService.testConnection as jest.Mock).mockResolvedValue({
            is_connected: false,
            error: 'Invalid API credentials'
        });

        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Configure')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Configure'));
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('Failed to connect to exchange. Please check your credentials.')).toBeInTheDocument();
        });
    });

    it('shows connection status for each exchange', async () => {
        (exchangeService.getExchangeStatus as jest.Mock).mockResolvedValue({
            is_connected: true,
            last_update: Date.now()
        });

        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Status: Connected')).toBeInTheDocument();
        });
    });

    it('shows error status when exchange is not connected', async () => {
        (exchangeService.getExchangeStatus as jest.Mock).mockResolvedValue({
            is_connected: false,
            last_update: Date.now(),
            error: 'Connection failed'
        });

        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Status: Disconnected')).toBeInTheDocument();
            expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
        });
    });

    it('updates button text when exchange is configured', async () => {
        render(<ExchangeManager />);

        await waitFor(() => {
            expect(screen.getByText('Update Configuration')).toBeInTheDocument();
        });
    });
}); 