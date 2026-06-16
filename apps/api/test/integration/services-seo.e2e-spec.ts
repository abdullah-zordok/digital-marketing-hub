import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { serviceRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('service SEO metadata', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addService(
      serviceRecord({
        slug: 'seo-strategy',
        title: 'SEO Strategy',
        status: ContentStatus.PUBLISHED,
        seoTitle: 'Custom SEO Title',
        seoDescription: 'Custom SEO description',
        canonicalUrl: 'https://example.com/services/seo-strategy',
        openGraphImage: 'https://example.com/seo.webp',
      }),
    );
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns explicit SEO metadata publicly', async () => {
    const response = await request(context.app.getHttpServer()).get('/api/v1/services/seo-strategy').expect(200);

    expect(response.body.data.seo).toEqual({
      title: 'Custom SEO Title',
      description: 'Custom SEO description',
      canonicalUrl: 'https://example.com/services/seo-strategy',
      openGraphImage: 'https://example.com/seo.webp',
    });
  });
});
