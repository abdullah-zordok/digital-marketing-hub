import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('blog management', () => {
  let context: TestAppContext;
  let editorToken: string;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    editorToken = await accessTokenFor(context.app, 'editor@example.com');
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('creates a category, publishes a post, then hides it after unpublish', async () => {
    const categoryResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/blog/categories')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'SEO', slug: 'seo' })
      .expect(201);

    const postResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/blog/posts')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ title: 'SEO Playbook', slug: 'seo-playbook', excerpt: 'SEO excerpt', categoryId: categoryResponse.body.data.id })
      .expect(201);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/blog/posts/${postResponse.body.data.id}/publish`)
      .set('Authorization', `Bearer ${editorToken}`)
      .expect(200);

    await request(context.app.getHttpServer()).get('/api/v1/blog/posts/seo-playbook').expect(200);
    await request(context.app.getHttpServer()).get('/api/v1/blog/categories/seo/posts').expect(200);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/blog/posts/${postResponse.body.data.id}/unpublish`)
      .set('Authorization', `Bearer ${editorToken}`)
      .expect(200);

    await request(context.app.getHttpServer()).get('/api/v1/blog/posts/seo-playbook').expect(404);
  });
});
