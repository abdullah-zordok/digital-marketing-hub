import { CacheService } from '../../../src/database/cache.service';

describe('CacheService', () => {
  it('gets, sets, and deletes JSON payloads', async () => {
    const redisClient = redisMock();
    const cacheService = new CacheService(redisClient);

    await cacheService.setJson('content:key', { title: 'Cached' }, 60);

    await expect(cacheService.getJson<{ title: string }>('content:key')).resolves.toEqual({ title: 'Cached' });
    await cacheService.delete('content:key');
    await expect(cacheService.getJson('content:key')).resolves.toBeNull();
  });

  it('deletes matching prefixed keys', async () => {
    const redisClient = redisMock();
    const cacheService = new CacheService(redisClient);

    await cacheService.setJson('public:one', { id: 1 }, 60);
    await cacheService.setJson('public:two', { id: 2 }, 60);
    await cacheService.deleteByPrefix('public:');

    await expect(cacheService.getJson('public:one')).resolves.toBeNull();
    await expect(cacheService.getJson('public:two')).resolves.toBeNull();
  });
});

function redisMock(): any {
  const storedPayloads = new Map<string, string>();
  return {
    get: jest.fn(async (key: string) => storedPayloads.get(key) ?? null),
    set: jest.fn(async (key: string, payload: string) => {
      storedPayloads.set(key, payload);
      return 'OK';
    }),
    del: jest.fn(async (...keys: string[]) => {
      keys.forEach((key) => storedPayloads.delete(key));
      return keys.length;
    }),
    keys: jest.fn(async (pattern: string) => {
      const prefix = pattern.replace('*', '');
      return Array.from(storedPayloads.keys()).filter((key) => key.startsWith(prefix));
    }),
  };
}
