import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('health API contract', () => {
  it('documents the foundation health endpoint and required response fields', () => {
    const contractPath = join(
      __dirname,
      '../../../../specs/001-core-backend-foundation/contracts/core-backend-foundation.openapi.yaml',
    );
    const contractDocument = parse(readFileSync(contractPath, 'utf8'));

    expect(contractDocument.paths['/health'].get.operationId).toBe('getHealth');
    expect(contractDocument.components.schemas.HealthData.required).toEqual([
      'api',
      'database',
      'redis',
      'environment',
      'timestamp',
    ]);
  });
});
