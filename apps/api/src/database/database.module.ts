import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { REDIS_CLIENT, RedisHealthService, redisClientProvider } from './redis.provider';

@Global()
@Module({
  providers: [PrismaService, redisClientProvider, RedisHealthService],
  exports: [PrismaService, REDIS_CLIENT, RedisHealthService],
})
export class DatabaseModule {}
