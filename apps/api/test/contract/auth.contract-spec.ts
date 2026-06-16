import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('auth API contract', () => {
  const contractPath = join(
    __dirname,
    '../../../../specs/001-core-backend-foundation/contracts/core-backend-foundation.openapi.yaml',
  );
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each(['/auth/login', '/auth/logout', '/auth/me', '/auth/refresh', '/admin/probe'])(
    'documents %s',
    (routePath) => {
      expect(contractDocument.paths[routePath]).toBeDefined();
    },
  );

  it('keeps protected routes behind bearer authentication', () => {
    expect(contractDocument.paths['/auth/me'].get.security).toEqual([{ bearerAuth: [] }]);
    expect(contractDocument.paths['/admin/probe'].get.security).toEqual([{ bearerAuth: [] }]);
  });
});
