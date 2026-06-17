import { HttpStatus } from '@nestjs/common';

import { TrafficLimitService } from '../../src/common/services/traffic-limit.service';

describe('production security contract', () => {
  it('uses a public-safe traffic-limit rejection message', async () => {
    const service = new TrafficLimitService(redisCounterMock());
    const limitRequest = { endpointGroup: 'login', identityKey: 'ip:1', maxRequests: 1, windowSeconds: 60 };

    await service.assertAllowed(limitRequest);

    await expect(service.assertAllowed(limitRequest)).rejects.toMatchObject({
      response: 'Too many requests. Please try again later.',
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });
});

function redisCounterMock(): any {
  let requestCount = 0;
  return {
    incr: jest.fn(async () => {
      requestCount += 1;
      return requestCount;
    }),
    expire: jest.fn(async () => 1),
  };
}
