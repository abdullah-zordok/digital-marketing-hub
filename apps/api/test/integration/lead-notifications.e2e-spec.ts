import request = require('supertest');

import { adminAccessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('lead notifications', () => {
  let context: TestAppContext;
  let adminToken: string;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    adminToken = await adminAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('stores lead and records skipped notification when delivery is not configured', async () => {
    const createResponse = await request(context.app.getHttpServer())
      .post('/api/v1/leads')
      .send({ email: 'notify@example.com', serviceInterest: 'SEO Strategy', message: 'Need help' })
      .expect(201);

    const detailResponse = await request(context.app.getHttpServer())
      .get(`/api/v1/admin/leads/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(detailResponse.body.data.notifications[0].status).toBe('SKIPPED');
  });
});
