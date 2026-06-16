import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { RolesGuard } from '../../../src/common/guards/roles.guard';
import { testUser } from '../../support/in-memory-prisma.service';

function contextFor(role: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: testUser('00000000-0000-4000-8000-000000000001', 'user@example.com', role as UserRole, 'hash'),
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows users with a required role', () => {
    const reflector = { getAllAndOverride: () => ['ADMIN', 'EDITOR'] } as unknown as Reflector;
    const rolesGuard = new RolesGuard(reflector);

    expect(rolesGuard.canActivate(contextFor('EDITOR'))).toBe(true);
  });

  it('rejects unsupported roles before protected actions run', () => {
    const reflector = { getAllAndOverride: () => ['ADMIN'] } as unknown as Reflector;
    const rolesGuard = new RolesGuard(reflector);

    expect(() => rolesGuard.canActivate(contextFor('OWNER'))).toThrow(ForbiddenException);
  });
});
