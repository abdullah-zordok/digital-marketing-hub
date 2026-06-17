import { ContentStatus } from '@prisma/client';
import request = require('supertest');

import { adminAccessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { blogPostRecord } from '../support/in-memory-prisma.service';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('blog public cache', () => {
  let context: TestAppContext;
  let accessToken: string;

  beforeAll(async () => {
    process.env.LOGIN_LIMIT = '20';
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    context.prismaService.addBlogPost(
      blogPostRecord({
        id: '20000000-0000-4000-8000-000000000501',
        slug: 'cached-blog',
        title: 'Cached Blog',
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      }),
    );
    accessToken = await adminAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('returns cached public blog posts and invalidates after admin changes', async () => {
    const firstPublicResponse = await request(context.app.getHttpServer())
      .get('/api/v1/blog/posts')
      .expect(200);

    expect(firstPublicResponse.body.data.items.map((post: { slug: string }) => post.slug)).toContain('cached-blog');

    const createdPostResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/blog/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Fresh Blog',
        slug: 'fresh-blog',
        excerpt: 'Fresh blog excerpt.',
      })
      .expect(201);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/blog/posts/${createdPostResponse.body.data.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const refreshedPublicResponse = await request(context.app.getHttpServer())
      .get('/api/v1/blog/posts')
      .expect(200);

    expect(refreshedPublicResponse.body.data.items.map((post: { slug: string }) => post.slug)).toEqual(
      expect.arrayContaining(['cached-blog', 'fresh-blog']),
    );
  });
});
