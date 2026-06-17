import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { TrafficLimitGuard } from './common/guards/traffic-limit.guard';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { OperationalLoggerService } from './common/services/operational-logger.service';
import { TrafficLimitService } from './common/services/traffic-limit.service';
import { ConfigModule } from './config/config.module';
import { RuntimeConfigService } from './config/runtime-config.service';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { LeadsModule } from './modules/leads/leads.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ServicesModule } from './modules/services/services.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    ServicesModule,
    BlogModule,
    ChatbotModule,
    LeadsModule,
    JobsModule,
    SettingsModule,
    UploadsModule,
    AnalyticsModule,
  ],
  providers: [
    RuntimeConfigService,
    OperationalLoggerService,
    TrafficLimitService,
    {
      provide: APP_GUARD,
      useClass: TrafficLimitGuard,
    },
  ],
  exports: [RuntimeConfigService, OperationalLoggerService, TrafficLimitService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
