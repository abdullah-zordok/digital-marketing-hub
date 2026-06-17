import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { adminAccessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { blogPostRecord, serviceRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('pagination maximum limits', () => {
  let context: TestAppContext;
  let accessToken: string;

  beforeAll(async () => {
    process.env.LOGIN_LIMIT = '20';
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    context.prismaService.addService(serviceRecord({ slug: 'public-service', status: ContentStatus.PUBLISHED }));
    context.prismaService.addBlogPost(blogPostRecord({ slug: 'public-post', status: ContentStatus.PUBLISHED, publishedAt: new Date() }));
    accessToken = await adminAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('clamps public and admin list limits to the configured maximum', async () => {
    const publicServicesResponse = await request(context.app.getHttpServer())
      .get('/api/v1/services?limit=500')
      .expect(200);
    const publicBlogResponse = await request(context.app.getHttpServer())
      .get('/api/v1/blog/posts?limit=500')
      .expect(200);
    const adminServicesResponse = await request(context.app.getHttpServer())
      .get('/api/v1/admin/services?limit=500')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(publicServicesResponse.body.data.meta.limit).toBe(100);
    expect(publicBlogResponse.body.data.meta.limit).toBe(100);
    expect(adminServicesResponse.body.data.meta.limit).toBe(100);
  });
});
