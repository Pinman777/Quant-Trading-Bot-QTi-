import { cacheService } from '../cache';

describe('CacheService', () => {
  beforeEach(async () => {
    await cacheService.clearAll();
  });

  it('should store and retrieve data', async () => {
    const testData = { test: 'data' };
    await cacheService.set('marketData', 'test-key', testData);
    const retrieved = await cacheService.get('marketData', 'test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should handle expired data', async () => {
    const testData = { test: 'data' };
    await cacheService.set('marketData', 'test-key', testData, 0.1); // 6 seconds expiry
    
    // Data should be available immediately
    const retrieved = await cacheService.get('marketData', 'test-key');
    expect(retrieved).toEqual(testData);

    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Data should be expired
    const expired = await cacheService.get('marketData', 'test-key');
    expect(expired).toBeNull();
  });

  it('should delete data', async () => {
    const testData = { test: 'data' };
    await cacheService.set('marketData', 'test-key', testData);
    
    // Data should be available
    const retrieved = await cacheService.get('marketData', 'test-key');
    expect(retrieved).toEqual(testData);

    // Delete data
    await cacheService.delete('marketData', 'test-key');
    
    // Data should be gone
    const deleted = await cacheService.get('marketData', 'test-key');
    expect(deleted).toBeNull();
  });

  it('should clear store', async () => {
    const testData1 = { test: 'data1' };
    const testData2 = { test: 'data2' };
    
    await cacheService.set('marketData', 'key1', testData1);
    await cacheService.set('marketData', 'key2', testData2);
    
    // Data should be available
    const retrieved1 = await cacheService.get('marketData', 'key1');
    const retrieved2 = await cacheService.get('marketData', 'key2');
    expect(retrieved1).toEqual(testData1);
    expect(retrieved2).toEqual(testData2);

    // Clear store
    await cacheService.clear('marketData');
    
    // All data should be gone
    const cleared1 = await cacheService.get('marketData', 'key1');
    const cleared2 = await cacheService.get('marketData', 'key2');
    expect(cleared1).toBeNull();
    expect(cleared2).toBeNull();
  });

  it('should handle different stores independently', async () => {
    const marketData = { type: 'market' };
    const botData = { type: 'bot' };
    
    await cacheService.set('marketData', 'key', marketData);
    await cacheService.set('botStats', 'key', botData);
    
    // Data should be in correct stores
    const retrievedMarket = await cacheService.get('marketData', 'key');
    const retrievedBot = await cacheService.get('botStats', 'key');
    expect(retrievedMarket).toEqual(marketData);
    expect(retrievedBot).toEqual(botData);

    // Clear one store
    await cacheService.clear('marketData');
    
    // Only market data should be cleared
    const clearedMarket = await cacheService.get('marketData', 'key');
    const remainingBot = await cacheService.get('botStats', 'key');
    expect(clearedMarket).toBeNull();
    expect(remainingBot).toEqual(botData);
  });
}); 