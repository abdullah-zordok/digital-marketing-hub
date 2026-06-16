import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { blogPostRecord, serviceRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

interface SluggedResponse {
  slug: string;
}

describe('public content visibility', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    context.prismaService.addService(serviceRecord({ slug: 'published-service', status: ContentStatus.PUBLISHED }));
    context.prismaService.addService(serviceRecord({ slug: 'draft-service', status: ContentStatus.DRAFT }));
    context.prismaService.addBlogPost(blogPostRecord({ slug: 'published-post', status: ContentStatus.PUBLISHED, publishedAt: new Date() }));
    context.prismaService.addBlogPost(blogPostRecord({ slug: 'draft-post', status: ContentStatus.DRAFT }));
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('exposes only published service and blog records', async () => {
    const servicesResponse = await request(context.app.getHttpServer()).get('/api/v1/services').expect(200);
    const postsResponse = await request(context.app.getHttpServer()).get('/api/v1/blog/posts').expect(200);

    expect(servicesResponse.body.data.items.map((service: SluggedResponse) => service.slug)).toEqual(['published-service']);
    expect(postsResponse.body.data.items.map((post: SluggedResponse) => post.slug)).toEqual(['published-post']);
  });
});
