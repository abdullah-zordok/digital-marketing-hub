import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisHealthService } from '../database/redis.provider';
import { PrismaService } from '../database/prisma.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisHealthService: RedisHealthService,
  ) {}

  async healthStatus(): Promise<HealthResponseDto> {
    const [databaseReady, redisReady] = await Promise.all([
      this.dependencyStatus(() => this.prismaService.databaseIsReady()),
      this.dependencyStatus(() => this.redisHealthService.redisIsReady()),
    ]);

    return {
      api: 'ok',
      database: databaseReady ? 'ok' : 'unavailable',
      redis: redisReady ? 'ok' : 'unavailable',
      environment: this.configService.getOrThrow<string>('NODE_ENV'),
      timestamp: new Date().toISOString(),
    };
  }

  private async dependencyStatus(readinessCheck: () => Promise<boolean>): Promise<boolean> {
    try {
      return await readinessCheck();
    } catch {
      return false;
    }
  }
}
