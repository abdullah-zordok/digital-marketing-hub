import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { createValidationPipe } from '../../src/common/pipes/validation.pipe';
import { REDIS_CLIENT, RedisHealthService } from '../../src/database/redis.provider';
import { PrismaService } from '../../src/database/prisma.service';
import { applyTestEnvironment } from './test-env';
import { InMemoryPrismaService } from './in-memory-prisma.service';

export interface TestAppContext {
  app: INestApplication;
  prismaService: InMemoryPrismaService;
}

export async function createTestApp(): Promise<TestAppContext> {
  applyTestEnvironment();

  const { AppModule } = await import('../../src/app.module');
  const prismaService = new InMemoryPrismaService();
  const testingModule = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .overrideProvider(RedisHealthService)
    .useValue({ redisIsReady: async () => true })
    .overrideProvider(REDIS_CLIENT)
    .useValue({ ping: async () => 'PONG', quit: async () => undefined })
    .compile();

  const app = testingModule.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  return { app, prismaService };
}
