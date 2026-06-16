import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface ContractOperation {
  security?: unknown;
}

describe('admin blog contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each([
    '/admin/blog/posts',
    '/admin/blog/posts/{id}',
    '/admin/blog/posts/{id}/publish',
    '/admin/blog/posts/{id}/unpublish',
    '/admin/blog/categories',
    '/admin/blog/categories/{id}',
  ])('documents protected route %s', (routePath) => {
    const methods = Object.values(contractDocument.paths[routePath]) as ContractOperation[];
    expect(methods.every((operation) => operation.security)).toBe(true);
  });
});
