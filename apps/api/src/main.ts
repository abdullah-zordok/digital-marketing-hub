import { NestFactory } from '@nestjs/core';
import { json, static as serveStatic, urlencoded } from 'express';
import { resolve } from 'node:path';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { AppEnvironment } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));
  app.use(process.env.UPLOAD_PUBLIC_PATH ?? '/uploads', serveStatic(resolve(process.env.UPLOAD_STORAGE_PATH ?? 'uploads')));
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
}

void bootstrap();

export type { AppEnvironment };
