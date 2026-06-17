import { ConfigService } from '@nestjs/config';

import { RuntimeConfigService } from '../../../src/config/runtime-config.service';
import { validateEnvironment } from '../../../src/config/env.schema';
import { applyTestEnvironment } from '../../support/test-env';

describe('RuntimeConfigService', () => {
  beforeEach(() => {
    applyTestEnvironment();
  });

  it('returns trusted origins as a trimmed list', () => {
    process.env.TRUSTED_ORIGINS = 'https://www.example.com, https://admin.example.com';
    const service = runtimeConfigService();

    expect(service.trustedOrigins()).toEqual(['https://www.example.com', 'https://admin.example.com']);
  });

  it('falls back to frontend origin when trusted origins are not configured', () => {
    delete process.env.TRUSTED_ORIGINS;
    const service = runtimeConfigService();

    expect(service.trustedOrigins()).toEqual(['http://localhost:5173']);
  });

  it('returns endpoint-specific traffic policies', () => {
    const service = runtimeConfigService();

    expect(service.trafficPolicyFor('login')).toEqual({ maxRequests: 10, windowSeconds: 600 });
    expect(service.trafficPolicyFor('lead')).toEqual({ maxRequests: 20, windowSeconds: 600 });
  });
});

function runtimeConfigService(): RuntimeConfigService {
  return new RuntimeConfigService(new ConfigService(validateEnvironment(process.env)));
}
