import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Prisma foundation schema', () => {
  const schemaPath = join(__dirname, '../../../prisma/schema.prisma');
  const schemaText = readFileSync(schemaPath, 'utf8');

  it.each([
    'User',
    'Service',
    'BlogPost',
    'BlogCategory',
    'Lead',
    'ChatSession',
    'ChatMessage',
    'KnowledgeBaseItem',
    'SiteSetting',
    'UploadedFile',
  ])('defines the %s entity', (modelName) => {
    expect(schemaText).toContain(`model ${modelName} {`);
  });

  it('uses durable identifiers, audit timestamps, slugs, and soft-delete fields', () => {
    expect(schemaText).toContain('@default(uuid())');
    expect(schemaText).toContain('createdAt');
    expect(schemaText).toContain('updatedAt');
    expect(schemaText).toContain('deletedAt');
    expect(schemaText).toContain('slug             String        @unique');
  });

  it('defines Spec 2 content SEO, discovery, and upload metadata fields', () => {
    expect(schemaText).toContain('canonicalUrl');
    expect(schemaText).toContain('openGraphImage');
    expect(schemaText).toContain('popularityScore');
    expect(schemaText).toContain('publicUrl     String');
    expect(schemaText).toContain('purpose       String');
  });
});
