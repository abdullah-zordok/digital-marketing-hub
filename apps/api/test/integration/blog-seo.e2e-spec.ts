import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { blogPostRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('blog SEO metadata', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addBlogPost(
      blogPostRecord({
        slug: 'seo-playbook',
        title: 'SEO Playbook',
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        seoTitle: 'Custom Blog Title',
        seoDescription: 'Custom Blog description',
        canonicalUrl: 'https://example.com/blog/posts/seo-playbook',
        openGraphImage: 'https://example.com/blog.webp',
      }),
    );
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns explicit SEO metadata publicly', async () => {
    const response = await request(context.app.getHttpServer()).get('/api/v1/blog/posts/seo-playbook').expect(200);

    expect(response.body.data.seo).toEqual({
      title: 'Custom Blog Title',
      description: 'Custom Blog description',
      canonicalUrl: 'https://example.com/blog/posts/seo-playbook',
      openGraphImage: 'https://example.com/blog.webp',
    });
  });
});
