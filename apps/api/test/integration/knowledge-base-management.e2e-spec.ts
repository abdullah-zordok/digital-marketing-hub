import request = require('supertest');

import { adminAccessTokenFor, editorAccessTokenFor, seedContentUsers, viewerAccessTokenFor } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('knowledge base management', () => {
  let context: TestAppContext;
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
    adminToken = await adminAccessTokenFor(context.app);
    editorToken = await editorAccessTokenFor(context.app);
    viewerToken = await viewerAccessTokenFor(context.app);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('allows content users to manage knowledge and rejects viewers', async () => {
    const createResponse = await request(context.app.getHttpServer())
      .post('/api/v1/admin/knowledge-base')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ title: 'SEO Guide', slug: 'seo-guide', content: 'Approved SEO guidance', sourceType: 'SERVICE', tags: ['seo'] })
      .expect(201);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/knowledge-base/${createResponse.body.data.id}/activate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(context.app.getHttpServer())
      .get('/api/v1/admin/knowledge-base?status=ACTIVE&tag=seo')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(context.app.getHttpServer())
      .patch(`/api/v1/admin/knowledge-base/${createResponse.body.data.id}/archive`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(context.app.getHttpServer())
      .post('/api/v1/admin/knowledge-base')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Viewer Draft', slug: 'viewer-draft', content: 'No', sourceType: 'GENERAL' })
      .expect(403);
  });
});
