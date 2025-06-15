import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  ExchangeType,
  ExchangeConfig,
  ExchangeInfo,
  MarketInfo,
  OrderBook,
  Trade,
  Order,
  Position,
  Balance,
  ExchangeStatus,
  ExchangeStats,
  MarketType
} from '../types/exchange';

export interface Exchange {
    name: string;
    supported_markets: string[];
    has_testnet: boolean;
    max_leverage: number;
    min_order_size: number;
    trading_fees: {
        maker: number;
        taker: number;
    };
    supported_timeframes: string[];
    supported_order_types: string[];
}

export interface ExchangeConfig {
    api_key: string;
    api_secret: string;
    testnet: boolean;
}

export interface ExchangeStatus {
    is_connected: boolean;
    last_update: number;
    error?: string;
}

export interface MarketInfo {
    symbol: string;
    base_asset: string;
    quote_asset: string;
    min_price: number;
    max_price: number;
    min_qty: number;
    max_qty: number;
    min_notional: number;
    price_precision: number;
    qty_precision: number;
}

export interface OrderBook {
    symbol: string;
    bids: [number, number][];
    asks: [number, number][];
    timestamp: number;
}

export interface Trade {
    id: string;
    symbol: string;
    side: string;
    price: number;
    qty: number;
    timestamp: number;
}

export interface Order {
    id: string;
    symbol: string;
    market_type: string;
    side: string;
    type: string;
    price: number;
    qty: number;
    filled_qty: number;
    status: string;
    timestamp: number;
}

export interface Position {
    symbol: string;
    side: string;
    entry_price: number;
    mark_price: number;
    qty: number;
    leverage: number;
    margin_type: string;
    liquidation_price: number;
    unrealized_pnl: number;
    realized_pnl: number;
}

export interface Balance {
    asset: string;
    free: number;
    locked: number;
}

class ExchangeService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/exchanges`;
    }

    async getSupportedExchanges(): Promise<Exchange[]> {
        const response = await axios.get(`${this.baseUrl}/supported`);
        return response.data;
    }

    async getExchangeStatus(exchange: string): Promise<ExchangeStatus> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/status`);
        return response.data;
    }

    async getExchangeConfig(exchange: string): Promise<ExchangeConfig> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/config`);
        return response.data;
    }

    async updateExchangeConfig(exchange: string, config: ExchangeConfig): Promise<ExchangeConfig> {
        const response = await axios.post(`${this.baseUrl}/${exchange}/config`, config);
        return response.data;
    }

    async getMarkets(exchange: string, market_type: string): Promise<MarketInfo[]> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/markets/${market_type}`);
        return response.data;
    }

    async getOrderBook(
        exchange: string,
        symbol: string,
        market_type: string,
        limit: number = 100
    ): Promise<OrderBook> {
        const response = await axios.get(
            `${this.baseUrl}/${exchange}/orderbook/${symbol}/${market_type}`,
            { params: { limit } }
        );
        return response.data;
    }

    async getTrades(
        exchange: string,
        symbol: string,
        market_type: string,
        limit: number = 100
    ): Promise<Trade[]> {
        const response = await axios.get(
            `${this.baseUrl}/${exchange}/trades/${symbol}/${market_type}`,
            { params: { limit } }
        );
        return response.data;
    }

    async createOrder(exchange: string, order: {
        symbol: string;
        market_type: string;
        side: string;
        type: string;
        quantity: number;
        price?: number;
        stop_price?: number;
        leverage?: number;
        margin_type?: string;
    }): Promise<Order> {
        const response = await axios.post(`${this.baseUrl}/${exchange}/orders`, order);
        return response.data;
    }

    async cancelOrder(
        exchange: string,
        symbol: string,
        market_type: string,
        order_id: string
    ): Promise<Order> {
        const response = await axios.delete(
            `${this.baseUrl}/${exchange}/orders/${symbol}/${market_type}/${order_id}`
        );
        return response.data;
    }

    async getOpenOrders(
        exchange: string,
        symbol?: string,
        market_type?: string
    ): Promise<Order[]> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/orders`, {
            params: { symbol, market_type }
        });
        return response.data;
    }

    async getOrderHistory(
        exchange: string,
        symbol?: string,
        market_type?: string,
        limit: number = 100
    ): Promise<Order[]> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/orders/history`, {
            params: { symbol, market_type, limit }
        });
        return response.data;
    }

    async getPositions(
        exchange: string,
        symbol?: string
    ): Promise<Position[]> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/positions`, {
            params: { symbol }
        });
        return response.data;
    }

    async getBalance(
        exchange: string,
        asset?: string
    ): Promise<Balance[]> {
        const response = await axios.get(`${this.baseUrl}/${exchange}/balance`, {
            params: { asset }
        });
        return response.data;
    }

    async testConnection(exchange: string, config: ExchangeConfig): Promise<ExchangeStatus> {
        const response = await axios.post(`${this.baseUrl}/${exchange}/test`, config);
        return response.data;
    }
}

export const exchangeService = new ExchangeService(); 