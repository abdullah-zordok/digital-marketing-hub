import { Inject, Injectable, OnModuleDestroy, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const redisUrl = configService.getOrThrow<string>('REDIS_URL');
    return new Redis(redisUrl, {
      lazyConnect: false,
      maxRetriesPerRequest: 1,
    });
  },
};

@Injectable()
export class RedisHealthService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async redisIsReady(): Promise<boolean> {
    const pongReply = await this.redisClient.ping();
    return pongReply === 'PONG';
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
  }
}
