import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('service role enforcement', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('rejects viewer service mutations', async () => {
    const viewerToken = await accessTokenFor(context.app, 'viewer@example.com');

    await request(context.app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'SEO', title: 'SEO Strategy', slug: 'seo-strategy' })
      .expect(403);
  });
});
