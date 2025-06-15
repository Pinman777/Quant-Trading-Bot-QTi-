import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type HistoricalData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { symbol, timeframe, limit = 1000 } = req.query;

  if (!symbol || !timeframe) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    // В реальном приложении здесь будет запрос к бэкенду FastAPI
    // Сейчас используем моковые данные для демонстрации
    const mockData: HistoricalData[] = [];
    const now = Date.now();
    const interval = getIntervalInMs(timeframe as string);
    
    for (let i = 0; i < Number(limit); i++) {
      const basePrice = 50000; // Базовая цена BTC
      const volatility = 0.02; // 2% волатильность
      const randomWalk = (Math.random() - 0.5) * volatility * basePrice;
      const price = basePrice + randomWalk;
      
      mockData.push({
        time: now - (Number(limit) - i) * interval,
        open: price,
        high: price * (1 + Math.random() * 0.01),
        low: price * (1 - Math.random() * 0.01),
        close: price * (1 + (Math.random() - 0.5) * 0.01),
        volume: Math.random() * 1000
      });
    }

    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function getIntervalInMs(timeframe: string): number {
  const unit = timeframe.slice(-1);
  const value = parseInt(timeframe.slice(0, -1));
  
  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000; // default to 1 minute
  }
} 