import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface ContractParameter {
  $ref?: string;
}

describe('public blog contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each(['/blog/posts', '/blog/posts/{slug}', '/blog/categories', '/blog/categories/{slug}/posts'])(
    'documents %s',
    (routePath) => {
      expect(contractDocument.paths[routePath]).toBeDefined();
    },
  );

  it('documents discovery query parameters', () => {
    const parameters = (contractDocument.paths['/blog/posts'].get.parameters as ContractParameter[]).map(
      (parameter) => parameter.$ref,
    );
    expect(parameters).toEqual(
      expect.arrayContaining([
        '#/components/parameters/Search',
        '#/components/parameters/Category',
        '#/components/parameters/Tag',
        '#/components/parameters/Sort',
      ]),
    );
  });
});
