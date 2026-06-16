import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('blog role enforcement', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('rejects viewer blog mutations', async () => {
    const viewerToken = await accessTokenFor(context.app, 'viewer@example.com');

    await request(context.app.getHttpServer())
      .post('/api/v1/admin/blog/posts')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'SEO Playbook', slug: 'seo-playbook' })
      .expect(403);
  });
});
