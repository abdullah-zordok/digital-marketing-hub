import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../database/redis.provider';

interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds?: number;
}

@Injectable()
export class ChatbotRateLimitService {
  private readonly memoryCounters = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  async ensureMessageAllowed(visitorId: string, source: string): Promise<void> {
    const visitorDecision = await this.limitDecisionFor(`chatbot:visitor:${visitorId}`, this.visitorLimit(), this.visitorWindow());
    const sourceDecision = await this.limitDecisionFor(`chatbot:source:${source}`, this.sourceLimit(), this.sourceWindow());

    if (!visitorDecision.allowed || !sourceDecision.allowed) {
      const retryAfterSeconds = visitorDecision.retryAfterSeconds ?? sourceDecision.retryAfterSeconds ?? this.visitorWindow();
      throw new HttpException(
        `Too many chatbot messages. Please try again in ${retryAfterSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async limitDecisionFor(key: string, limit: number, windowSeconds: number): Promise<RateLimitDecision> {
    if (this.redisSupportsCounters()) {
      return this.redisLimitDecisionFor(key, limit, windowSeconds);
    }

    return this.memoryLimitDecisionFor(key, limit, windowSeconds);
  }

  private async redisLimitDecisionFor(key: string, limit: number, windowSeconds: number): Promise<RateLimitDecision> {
    const count = await this.redisClient.incr(key);

    if (count === 1) {
      await this.redisClient.expire(key, windowSeconds);
    }

    return count > limit ? { allowed: false, retryAfterSeconds: windowSeconds } : { allowed: true };
  }

  private memoryLimitDecisionFor(key: string, limit: number, windowSeconds: number): RateLimitDecision {
    const now = Date.now();
    const currentCounter = this.memoryCounters.get(key);
    const counter = currentCounter && currentCounter.expiresAt > now ? currentCounter : { count: 0, expiresAt: now + windowSeconds * 1000 };
    counter.count += 1;
    this.memoryCounters.set(key, counter);
    return counter.count > limit ? { allowed: false, retryAfterSeconds: windowSeconds } : { allowed: true };
  }

  private redisSupportsCounters(): boolean {
    return typeof this.redisClient.incr === 'function' && typeof this.redisClient.expire === 'function';
  }

  private visitorLimit(): number {
    return this.configService.get<number>('CHATBOT_VISITOR_LIMIT') ?? 20;
  }

  private visitorWindow(): number {
    return this.configService.get<number>('CHATBOT_VISITOR_WINDOW_SECONDS') ?? 600;
  }

  private sourceLimit(): number {
    return this.configService.get<number>('CHATBOT_SOURCE_LIMIT') ?? 100;
  }

  private sourceWindow(): number {
    return this.configService.get<number>('CHATBOT_SOURCE_WINDOW_SECONDS') ?? 3600;
  }
}
