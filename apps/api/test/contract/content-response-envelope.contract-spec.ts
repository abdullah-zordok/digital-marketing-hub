import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('content response envelope contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it.each([
    'ServiceListResponse',
    'ServiceDetailResponse',
    'BlogPostListResponse',
    'BlogPostDetailResponse',
    'BlogCategoryListResponse',
    'UploadResponse',
  ])('composes %s from SuccessResponse', (schemaName) => {
    expect(contractDocument.components.schemas[schemaName].allOf[0].$ref).toBe(
      '#/components/schemas/SuccessResponse',
    );
  });
});
