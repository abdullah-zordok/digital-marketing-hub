import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('upload validation and roles', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
    await seedContentUsers(context.prismaService);
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('rejects viewer uploads and unsupported file types', async () => {
    const viewerToken = await accessTokenFor(context.app, 'viewer@example.com');
    const adminToken = await accessTokenFor(context.app, 'admin@example.com');

    await request(context.app.getHttpServer())
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${viewerToken}`)
      .field('purpose', 'CONTENT_IMAGE')
      .attach('file', Buffer.from('image-content'), { filename: 'cover.webp', contentType: 'image/webp' })
      .expect(403);

    await request(context.app.getHttpServer())
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('purpose', 'CONTENT_IMAGE')
      .attach('file', Buffer.from('pdf'), { filename: 'brief.pdf', contentType: 'application/pdf' })
      .expect(400);
  });
});
