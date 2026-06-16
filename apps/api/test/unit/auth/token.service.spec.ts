import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { TokenService } from '../../../src/modules/auth/token.service';
import { applyTestEnvironment } from '../../support/test-env';
import { testUser } from '../../support/in-memory-prisma.service';

describe('TokenService', () => {
  beforeEach(() => {
    applyTestEnvironment();
  });

  it('creates verifiable access and refresh tokens for the same user version', async () => {
    const tokenService = new TokenService(new ConfigService(), new JwtService());
    const adminUser = testUser('00000000-0000-4000-8000-000000000001', 'admin@example.com', UserRole.ADMIN, 'hash');

    const tokenPair = await tokenService.tokenPairFor(adminUser);
    const accessPayload = await tokenService.accessPayloadFor(tokenPair.accessToken);
    const refreshPayload = await tokenService.refreshPayloadFor(tokenPair.refreshToken);

    expect(accessPayload).toMatchObject({
      sub: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
      type: 'access',
      tokenVersion: 0,
    });
    expect(refreshPayload).toMatchObject({
      sub: adminUser.id,
      type: 'refresh',
      tokenVersion: 0,
    });
  });
});
