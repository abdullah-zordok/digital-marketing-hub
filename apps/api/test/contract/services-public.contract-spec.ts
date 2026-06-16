import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('public services contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each(['/services', '/services/{slug}'])('documents %s', (routePath) => {
    expect(contractDocument.paths[routePath]).toBeDefined();
  });

  it('documents SEO metadata on service responses', () => {
    expect(contractDocument.components.schemas.Service.required).toContain('seo');
    expect(contractDocument.components.schemas.SeoMetadata.required).toEqual([
      'title',
      'description',
      'canonicalUrl',
      'openGraphImage',
    ]);
  });
});
