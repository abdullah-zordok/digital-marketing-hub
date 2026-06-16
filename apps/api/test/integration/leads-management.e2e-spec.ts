import request = require('supertest');

import { adminAccessTokenFor, seedContentUsers, viewerAccessTokenFor } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('leads management', () => {
  let context: TestAppContext;
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    adminToken = await adminAccessTokenFor(context.app);
    viewerToken = await viewerAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('creates contact-form leads and supports admin lead workflows', async () => {
    const createResponse = await request(context.app.getHttpServer())
      .post('/api/v1/leads')
      .send({ email: 'lead@example.com', serviceInterest: 'SEO Strategy', message: 'Need help', source: 'CONTACT_FORM' })
      .expect(201);

    const leadId = createResponse.body.data.id;

    await request(context.app.getHttpServer()).get('/api/v1/admin/leads').set('Authorization', `Bearer ${adminToken}`).expect(200);
    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONTACTED' })
      .expect(200);
    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'updated@example.com', serviceInterest: 'SEO Strategy' })
      .expect(200);
    await request(context.app.getHttpServer()).get('/api/v1/admin/leads').set('Authorization', `Bearer ${viewerToken}`).expect(403);
  });
});
