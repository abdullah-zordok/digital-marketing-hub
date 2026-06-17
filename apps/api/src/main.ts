import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import { json, static as serveStatic, urlencoded } from 'express';
import helmet from 'helmet';
import { resolve } from 'node:path';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { OperationalLoggerService } from './common/services/operational-logger.service';
import { AppEnvironment } from './config/env.schema';
import { RuntimeConfigService } from './config/runtime-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const runtimeConfig = app.get(RuntimeConfigService);
  const operationalLogger = app.get(OperationalLoggerService);
  const port = Number(process.env.PORT ?? 3000);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(compression());
  app.enableCors({ origin: runtimeConfig.trustedOrigins(), credentials: true });
  app.use(json({ limit: runtimeConfig.requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: runtimeConfig.requestBodyLimit }));
  app.use(runtimeConfig.uploadPublicPath, serveStatic(resolve(runtimeConfig.uploadStoragePath)));
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  configureApiDocumentation(app, runtimeConfig);
  operationalLogger.logEvent({
    eventType: 'startup.initialized',
    severity: 'info',
    safeContext: { environment: runtimeConfig.nodeEnv, port },
  });

  await app.listen(port);
  operationalLogger.logEvent({
    eventType: 'startup.ready',
    severity: 'info',
    safeContext: { environment: runtimeConfig.nodeEnv, port },
  });
}

void bootstrap();

export type { AppEnvironment };

function configureApiDocumentation(app: Awaited<ReturnType<typeof NestFactory.create>>, runtimeConfig: RuntimeConfigService): void {
  if (!runtimeConfig.docsEnabled) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Digital Marketing Hub API')
    .setDescription('Production-ready backend API contracts')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(runtimeConfig.docsPath, app, swaggerDocument);
}
