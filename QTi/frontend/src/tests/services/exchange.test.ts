import axios from 'axios';
import { exchangeService } from '../../services/exchange';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExchangeService', () => {
    const mockExchange = {
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
    };

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
    });

    describe('getSupportedExchanges', () => {
        it('should return list of supported exchanges', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: [mockExchange] });

            const result = await exchangeService.getSupportedExchanges();

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/exchanges/supported');
            expect(result).toEqual([mockExchange]);
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            mockedAxios.get.mockRejectedValueOnce(error);

            await expect(exchangeService.getSupportedExchanges()).rejects.toThrow('Network error');
        });
    });

    describe('getExchangeStatus', () => {
        it('should return exchange status', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: mockStatus });

            const result = await exchangeService.getExchangeStatus('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/exchanges/binance/status');
            expect(result).toEqual(mockStatus);
        });
    });

    describe('getExchangeConfig', () => {
        it('should return exchange configuration', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: mockConfig });

            const result = await exchangeService.getExchangeConfig('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/exchanges/binance/config');
            expect(result).toEqual(mockConfig);
        });
    });

    describe('updateExchangeConfig', () => {
        it('should update exchange configuration', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: mockConfig });

            const result = await exchangeService.updateExchangeConfig('binance', mockConfig);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/exchanges/binance/config',
                mockConfig
            );
            expect(result).toEqual(mockConfig);
        });
    });

    describe('getMarkets', () => {
        it('should return list of markets', async () => {
            const mockMarkets = [
                {
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
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockMarkets });

            const result = await exchangeService.getMarkets('binance', 'spot');

            expect(mockedAxios.get).toHaveBeenCalledWith('/api/exchanges/binance/markets/spot');
            expect(result).toEqual(mockMarkets);
        });
    });

    describe('getOrderBook', () => {
        it('should return order book', async () => {
            const mockOrderBook = {
                symbol: 'BTC/USDT',
                bids: [[50000, 1.0], [49900, 2.0]],
                asks: [[50100, 1.0], [50200, 2.0]],
                timestamp: Date.now()
            };
            mockedAxios.get.mockResolvedValueOnce({ data: mockOrderBook });

            const result = await exchangeService.getOrderBook('binance', 'BTC/USDT', 'spot');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/orderbook/BTC/USDT/spot',
                { params: { limit: 100 } }
            );
            expect(result).toEqual(mockOrderBook);
        });
    });

    describe('getTrades', () => {
        it('should return recent trades', async () => {
            const mockTrades = [
                {
                    id: '1',
                    symbol: 'BTC/USDT',
                    side: 'buy',
                    price: 50000,
                    qty: 1.0,
                    timestamp: Date.now()
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockTrades });

            const result = await exchangeService.getTrades('binance', 'BTC/USDT', 'spot');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/trades/BTC/USDT/spot',
                { params: { limit: 100 } }
            );
            expect(result).toEqual(mockTrades);
        });
    });

    describe('createOrder', () => {
        it('should create new order', async () => {
            const mockOrder = {
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
            };
            mockedAxios.post.mockResolvedValueOnce({ data: mockOrder });

            const orderParams = {
                symbol: 'BTC/USDT',
                market_type: 'spot',
                side: 'buy',
                type: 'limit',
                quantity: 1.0,
                price: 50000
            };

            const result = await exchangeService.createOrder('binance', orderParams);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/exchanges/binance/orders',
                orderParams
            );
            expect(result).toEqual(mockOrder);
        });
    });

    describe('cancelOrder', () => {
        it('should cancel order', async () => {
            const mockOrder = {
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
            };
            mockedAxios.delete.mockResolvedValueOnce({ data: mockOrder });

            const result = await exchangeService.cancelOrder('binance', 'BTC/USDT', 'spot', '1');

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                '/api/exchanges/binance/orders/BTC/USDT/spot/1'
            );
            expect(result).toEqual(mockOrder);
        });
    });

    describe('getOpenOrders', () => {
        it('should return open orders', async () => {
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
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockOrders });

            const result = await exchangeService.getOpenOrders('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/orders',
                { params: {} }
            );
            expect(result).toEqual(mockOrders);
        });
    });

    describe('getOrderHistory', () => {
        it('should return order history', async () => {
            const mockOrders = [
                {
                    id: '1',
                    symbol: 'BTC/USDT',
                    market_type: 'spot',
                    side: 'buy',
                    type: 'limit',
                    price: 50000,
                    qty: 1.0,
                    filled_qty: 1.0,
                    status: 'filled',
                    timestamp: Date.now()
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockOrders });

            const result = await exchangeService.getOrderHistory('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/orders/history',
                { params: { limit: 100 } }
            );
            expect(result).toEqual(mockOrders);
        });
    });

    describe('getPositions', () => {
        it('should return positions', async () => {
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
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockPositions });

            const result = await exchangeService.getPositions('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/positions',
                { params: {} }
            );
            expect(result).toEqual(mockPositions);
        });
    });

    describe('getBalance', () => {
        it('should return balance', async () => {
            const mockBalances = [
                {
                    asset: 'BTC',
                    free: 1.0,
                    locked: 0.0
                }
            ];
            mockedAxios.get.mockResolvedValueOnce({ data: mockBalances });

            const result = await exchangeService.getBalance('binance');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/exchanges/binance/balance',
                { params: {} }
            );
            expect(result).toEqual(mockBalances);
        });
    });

    describe('testConnection', () => {
        it('should test connection', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: mockStatus });

            const result = await exchangeService.testConnection('binance', mockConfig);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/exchanges/binance/test',
                mockConfig
            );
            expect(result).toEqual(mockStatus);
        });
    });
}); 