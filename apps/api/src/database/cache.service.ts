import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async getJson<TCached>(cacheKey: string): Promise<TCached | null> {
    const cachedPayload = await this.redisClient.get(cacheKey);
    return cachedPayload ? (JSON.parse(cachedPayload) as TCached) : null;
  }

  async setJson(cacheKey: string, payload: unknown, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(cacheKey, JSON.stringify(payload), 'EX', ttlSeconds);
  }

  async delete(cacheKey: string): Promise<void> {
    await this.redisClient.del(cacheKey);
  }

  async deleteByPrefix(cachePrefix: string): Promise<void> {
    const matchingKeys = await this.redisClient.keys(`${cachePrefix}*`);
    if (matchingKeys.length > 0) {
      await this.redisClient.del(...matchingKeys);
    }
  }
}
