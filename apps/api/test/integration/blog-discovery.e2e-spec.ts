import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { blogCategoryRecord, blogPostRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('public blog discovery', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addBlogCategory(blogCategoryRecord({ id: '20000000-0000-4000-8000-000000000001', slug: 'seo' }));

    for (let index = 1; index <= 20; index += 1) {
      context.prismaService.addBlogPost(
        blogPostRecord({
          id: `30000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
          title: `SEO Playbook ${index}`,
          slug: `seo-playbook-${index}`,
          categoryId: '20000000-0000-4000-8000-000000000001',
          tags: ['seo', 'strategy'],
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(Date.UTC(2026, 0, index)),
          popularityScore: 100 - index,
        }),
      );
    }
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns searched, filtered, paginated, and sorted published posts', async () => {
    const response = await request(context.app.getHttpServer())
      .get('/api/v1/blog/posts?page=1&limit=10&search=SEO&category=seo&tag=seo&sort=popular')
      .expect(200);

    expect(response.body.data.items).toHaveLength(10);
    expect(response.body.data.items[0].slug).toBe('seo-playbook-1');
    expect(response.body.data.meta).toMatchObject({ page: 1, limit: 10, totalItems: 20, totalPages: 2 });
  });
});
