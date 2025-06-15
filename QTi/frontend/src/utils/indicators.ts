export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema.push(sum / period);
  
  // Calculate EMA for the rest of the data
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  
  // Pad the beginning with NaN
  return Array(period - 1).fill(NaN).concat(ema);
}

// Relative Strength Index
export function calculateRSI(data: number[], period: number): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Calculate RSI
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(NaN);
      continue;
    }
    
    avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((macd, i) => macd - signalLine[i]);
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

// Bollinger Bands
export function calculateBollingerBands(data: number[], period: number, multiplier: number): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const sma = calculateSMA(data, period);
  const stdDev: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      stdDev.push(NaN);
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const squaredDiffs = slice.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    stdDev.push(Math.sqrt(variance));
  }
  
  const upper = sma.map((value, i) => value + (stdDev[i] * multiplier));
  const lower = sma.map((value, i) => value - (stdDev[i] * multiplier));
  
  return {
    upper,
    middle: sma,
    lower
  };
}

// Stochastic Oscillator
export function calculateStochastic(data: CandleData[], period: number, smoothK: number): {
  k: number[];
  d: number[];
} {
  const k: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      k.push(NaN);
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const highestHigh = Math.max(...slice.map(candle => candle.high));
    const lowestLow = Math.min(...slice.map(candle => candle.low));
    const currentClose = data[i].close;
    
    const rawK = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push(rawK);
  }
  
  const smoothedK = calculateSMA(k.filter(x => !isNaN(x)), smoothK);
  const d = calculateSMA(smoothedK, 3);
  
  return {
    k: Array(period - 1).fill(NaN).concat(smoothedK),
    d: Array(period - 1).fill(NaN).concat(d)
  };
}

// Average Directional Index (ADX)
export function calculateADX(data: CandleData[], period: number): {
  adx: number[];
  plusDI: number[];
  minusDI: number[];
} {
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  // Calculate True Range and Directional Movement
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;
    const prevClose = data[i - 1].close;
    
    tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  
  // Calculate smoothed TR and DM
  const smoothedTR = calculateEMA(tr, period);
  const smoothedPlusDM = calculateEMA(plusDM, period);
  const smoothedMinusDM = calculateEMA(minusDM, period);
  
  // Calculate +DI and -DI
  const plusDI = smoothedPlusDM.map((dm, i) => (dm / smoothedTR[i]) * 100);
  const minusDI = smoothedMinusDM.map((dm, i) => (dm / smoothedTR[i]) * 100);
  
  // Calculate DX and ADX
  const dx = plusDI.map((plus, i) => {
    const minus = minusDI[i];
    return Math.abs(plus - minus) / (plus + minus) * 100;
  });
  
  const adx = calculateEMA(dx, period);
  
  return {
    adx,
    plusDI,
    minusDI
  };
} 