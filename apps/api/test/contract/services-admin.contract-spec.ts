import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface ContractOperation {
  security?: unknown;
}

describe('admin services contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each([
    '/admin/services',
    '/admin/services/reorder',
    '/admin/services/{id}',
    '/admin/services/{id}/publish',
    '/admin/services/{id}/unpublish',
  ])('documents protected route %s', (routePath) => {
    const methods = Object.values(contractDocument.paths[routePath]) as ContractOperation[];
    expect(methods.every((operation) => operation.security)).toBe(true);
  });
});
