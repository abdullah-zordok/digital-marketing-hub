import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('foundation response envelope contract', () => {
  it('requires standard success and error envelope fields', () => {
    const contractPath = join(
      __dirname,
      '../../../../specs/001-core-backend-foundation/contracts/core-backend-foundation.openapi.yaml',
    );
    const contractDocument = parse(readFileSync(contractPath, 'utf8'));

    expect(contractDocument.components.schemas.SuccessResponse.required).toEqual([
      'success',
      'message',
      'data',
    ]);
    expect(contractDocument.components.schemas.ErrorResponse.required).toEqual([
      'success',
      'message',
      'errors',
    ]);
  });
});
