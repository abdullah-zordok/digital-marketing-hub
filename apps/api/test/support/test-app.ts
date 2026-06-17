import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

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

export interface TestAppOptions {
  redisReady?: boolean;
}

export async function createTestApp(options: TestAppOptions = {}): Promise<TestAppContext> {
  applyTestEnvironment();

  const { AppModule } = await import('../../src/app.module');
  const prismaService = new InMemoryPrismaService();
  const testingModule = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .overrideProvider(RedisHealthService)
    .useValue({ redisIsReady: async () => options.redisReady ?? true })
    .overrideProvider(REDIS_CLIENT)
    .useValue(redisClientMock())
    .compile();

  const app = testingModule.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({ origin: process.env.TRUSTED_ORIGINS?.split(',') ?? process.env.FRONTEND_URL, credentials: true });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  configureTestApiDocumentation(app);
  await app.init();

  return { app, prismaService };
}

function configureTestApiDocumentation(app: INestApplication): void {
  if (process.env.DOCS_ENABLED !== 'true') {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Digital Marketing Hub API')
    .setDescription('Production-ready backend API contracts')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(process.env.DOCS_PATH ?? 'api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
}

function redisClientMock(): Record<string, unknown> {
  const payloads = new Map<string, string>();
  const counters = new Map<string, number>();

  return {
    ping: async () => 'PONG',
    quit: async () => undefined,
    get: async (key: string) => payloads.get(key) ?? null,
    set: async (key: string, payload: string) => {
      payloads.set(key, payload);
      return 'OK';
    },
    del: async (...keys: string[]) => {
      keys.forEach((key) => {
        payloads.delete(key);
        counters.delete(key);
      });
      return keys.length;
    },
    keys: async (pattern: string) => {
      const prefix = pattern.replace('*', '');
      return Array.from(payloads.keys()).filter((key) => key.startsWith(prefix));
    },
    incr: async (key: string) => {
      const requestCount = (counters.get(key) ?? 0) + 1;
      counters.set(key, requestCount);
      return requestCount;
    },
    expire: async () => 1,
  };
}
