import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { CacheService } from './cache.service';
import { REDIS_CLIENT, RedisHealthService, redisClientProvider } from './redis.provider';

@Global()
@Module({
  providers: [PrismaService, redisClientProvider, RedisHealthService, CacheService],
  exports: [PrismaService, REDIS_CLIENT, RedisHealthService, CacheService],
})
export class DatabaseModule {}
