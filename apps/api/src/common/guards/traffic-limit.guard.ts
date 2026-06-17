import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { RuntimeConfigService } from '../../config/runtime-config.service';
import { TrafficLimitService } from '../services/traffic-limit.service';

export const TRAFFIC_LIMIT_GROUP = 'trafficLimitGroup';
export type TrafficLimitGroup = 'login' | 'chatbot' | 'lead' | 'upload';

export const TrafficLimited = (endpointGroup: TrafficLimitGroup): MethodDecorator =>
  SetMetadata(TRAFFIC_LIMIT_GROUP, endpointGroup);

@Injectable()
export class TrafficLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly runtimeConfig: RuntimeConfigService,
    private readonly trafficLimitService: TrafficLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const endpointGroup = this.reflector.getAllAndOverride<TrafficLimitGroup>(TRAFFIC_LIMIT_GROUP, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!endpointGroup) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const policy = this.runtimeConfig.trafficPolicyFor(endpointGroup);
    await this.trafficLimitService.assertAllowed({
      endpointGroup,
      identityKey: this.identityKeyFor(request),
      ...policy,
    });
    return true;
  }

  private identityKeyFor(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return forwardedAddress?.split(',')[0].trim() || request.ip || request.socket.remoteAddress || 'unknown';
  }
}
