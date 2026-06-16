import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('admin service management', () => {
  let context: TestAppContext;
  let adminToken: string;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    adminToken = await accessTokenFor(context.app, 'admin@example.com');
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('creates, publishes, hides, and reorders services', async () => {
    const createResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'SEO', title: 'SEO Strategy', slug: 'seo-strategy', fullDescription: 'SEO planning' })
      .expect(201);
    const serviceId = createResponse.body.data.id;

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/services/${serviceId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(context.app.getHttpServer()).get('/api/v1/services/seo-strategy').expect(200);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/services/${serviceId}/unpublish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(context.app.getHttpServer()).get('/api/v1/services/seo-strategy').expect(404);

    await request(context.app.getHttpServer())
      .patch('/api/v1/admin/services/reorder')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ id: serviceId, sortOrder: 3 }] })
      .expect(200);
  });
});
