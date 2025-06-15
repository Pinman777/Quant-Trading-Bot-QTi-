import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com/v1';

export interface CoinMarketCapResponse<T> {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: T;
}

export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  } | null;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      last_updated: string;
    };
  };
}

export interface GlobalMetrics {
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  active_market_pairs: number;
  active_exchanges: number;
  total_exchanges: number;
  eth_dominance: number;
  btc_dominance: number;
  eth_dominance_24h_percentage_change: number;
  btc_dominance_24h_percentage_change: number;
  defi_volume_24h: number;
  defi_market_cap: number;
  defi_24h_percentage_change: number;
  stablecoin_volume_24h: number;
  stablecoin_market_cap: number;
  stablecoin_24h_percentage_change: number;
  derivatives_volume_24h: number;
  derivatives_24h_percentage_change: number;
  total_market_cap: number;
  total_volume_24h: number;
  total_market_cap_yesterday: number;
  total_volume_24h_yesterday: number;
  total_market_cap_yesterday_percentage_change: number;
  total_volume_24h_yesterday_percentage_change: number;
  last_updated: string;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-CMC_PRO_API_KEY': API_KEY,
  },
});

export const coinMarketCapService = {
  // Получение списка криптовалют
  getCryptocurrencies: async (params: {
    start?: number;
    limit?: number;
    convert?: string;
    sort?: string;
    sort_dir?: 'asc' | 'desc';
    cryptocurrency_type?: string;
    tag?: string;
    aux?: string;
  }): Promise<CoinMarketCapResponse<Cryptocurrency[]>> => {
    const response = await api.get('/cryptocurrency/listings/latest', { params });
    return response.data;
  },

  // Получение информации о конкретной криптовалюте
  getCryptocurrency: async (params: {
    id?: number;
    slug?: string;
    symbol?: string;
    convert?: string;
    aux?: string;
  }): Promise<CoinMarketCapResponse<{ [key: string]: Cryptocurrency }>> => {
    const response = await api.get('/cryptocurrency/info', { params });
    return response.data;
  },

  // Получение глобальных метрик рынка
  getGlobalMetrics: async (params: {
    convert?: string;
    aux?: string;
  }): Promise<CoinMarketCapResponse<GlobalMetrics>> => {
    const response = await api.get('/global-metrics/quotes/latest', { params });
    return response.data;
  },

  // Получение исторических данных
  getHistoricalData: async (params: {
    id: number;
    time_start?: string;
    time_end?: string;
    count?: number;
    interval?: string;
    convert?: string;
  }): Promise<CoinMarketCapResponse<{
    quotes: Array<{
      timestamp: string;
      quote: {
        USD: {
          price: number;
          volume_24h: number;
          market_cap: number;
          timestamp: string;
        };
      };
    }>;
  }>> => {
    const response = await api.get('/cryptocurrency/quotes/historical', { params });
    return response.data;
  },

  // Получение списка бирж
  getExchanges: async (params: {
    start?: number;
    limit?: number;
    sort?: string;
    sort_dir?: 'asc' | 'desc';
    market_type?: string;
    aux?: string;
  }): Promise<CoinMarketCapResponse<Array<{
    id: number;
    name: string;
    slug: string;
    is_active: number;
    first_historical_data: string;
    last_historical_data: string;
    platform: {
      id: number;
      name: string;
      symbol: string;
      slug: string;
      token_address: string;
    } | null;
  }>>> => {
    const response = await api.get('/exchange/listings/latest', { params });
    return response.data;
  },
}; 