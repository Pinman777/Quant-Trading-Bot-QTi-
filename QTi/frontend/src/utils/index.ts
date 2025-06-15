import { format } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

export const formatNumber = (num: number, decimals = 2): string => {
  return num.toFixed(decimals);
};

export const formatPercentage = (num: number, decimals = 2): string => {
  return `${(num * 100).toFixed(decimals)}%`;
};

export const formatCurrency = (num: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
};

export const calculateProfit = (trades: Array<{ profit: number }>): number => {
  return trades.reduce((sum, trade) => sum + trade.profit, 0);
};

export const calculateWinRate = (trades: Array<{ profit: number }>): number => {
  const winningTrades = trades.filter((trade) => trade.profit > 0);
  return trades.length > 0 ? winningTrades.length / trades.length : 0;
};

export const calculateProfitFactor = (trades: Array<{ profit: number }>): number => {
  const profits = trades.filter((trade) => trade.profit > 0).reduce((sum, trade) => sum + trade.profit, 0);
  const losses = Math.abs(trades.filter((trade) => trade.profit < 0).reduce((sum, trade) => sum + trade.profit, 0));
  return losses > 0 ? profits / losses : 0;
};

export const calculateMaxDrawdown = (trades: Array<{ profit: number }>): number => {
  let maxDrawdown = 0;
  let peak = 0;
  let currentValue = 0;

  trades.forEach((trade) => {
    currentValue += trade.profit;
    if (currentValue > peak) {
      peak = currentValue;
    }
    const drawdown = (peak - currentValue) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
};

export const calculateSharpeRatio = (
  trades: Array<{ profit: number }>,
  riskFreeRate = 0.02
): number => {
  if (trades.length < 2) return 0;

  const returns = trades.map((trade) => trade.profit);
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev > 0 ? (mean - riskFreeRate) / stdDev : 0;
}; 