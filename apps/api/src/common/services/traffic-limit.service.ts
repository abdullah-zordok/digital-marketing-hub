import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../database/redis.provider';

export interface TrafficLimitRequest {
  endpointGroup: string;
  identityKey: string;
  maxRequests: number;
  windowSeconds: number;
}

@Injectable()
export class TrafficLimitService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async assertAllowed(limitRequest: TrafficLimitRequest): Promise<void> {
    const counterKey = this.counterKeyFor(limitRequest);
    const requestCount = await this.redisClient.incr(counterKey);

    if (requestCount === 1) {
      await this.redisClient.expire(counterKey, limitRequest.windowSeconds);
    }

    if (requestCount > limitRequest.maxRequests) {
      throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private counterKeyFor(limitRequest: TrafficLimitRequest): string {
    return `traffic:${limitRequest.endpointGroup}:${limitRequest.identityKey}`;
  }
}
