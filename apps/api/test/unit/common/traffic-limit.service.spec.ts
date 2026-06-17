import { HttpStatus } from '@nestjs/common';

import { TrafficLimitService } from '../../../src/common/services/traffic-limit.service';

describe('TrafficLimitService', () => {
  it('allows requests inside the configured window', async () => {
    const service = new TrafficLimitService(redisCounterMock());

    await expect(
      service.assertAllowed({ endpointGroup: 'login', identityKey: 'ip:1', maxRequests: 2, windowSeconds: 60 }),
    ).resolves.toBeUndefined();
  });

  it('rejects requests after the limit is exceeded', async () => {
    const service = new TrafficLimitService(redisCounterMock());
    const limitRequest = { endpointGroup: 'login', identityKey: 'ip:1', maxRequests: 1, windowSeconds: 60 };

    await service.assertAllowed(limitRequest);

    await expect(service.assertAllowed(limitRequest)).rejects.toHaveProperty('status', HttpStatus.TOO_MANY_REQUESTS);
  });
});

function redisCounterMock(): any {
  const counters = new Map<string, number>();
  return {
    incr: jest.fn(async (key: string) => {
      const requestCount = (counters.get(key) ?? 0) + 1;
      counters.set(key, requestCount);
      return requestCount;
    }),
    expire: jest.fn(async () => 1),
  };
}
