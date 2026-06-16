import request = require('supertest');

import { accessTokenFor, seedContentUsers } from '../support/content-auth.fixture';
import { createTestApp, TestAppContext } from '../support/test-app';

describe('content image uploads', () => {
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

  it('stores valid image metadata and returns a public URL', async () => {
    const response = await request(context.app.getHttpServer())
      .post('/api/v1/admin/uploads')
      .set('Authorization', `Bearer ${editorToken}`)
      .field('purpose', 'CONTENT_IMAGE')
      .attach('file', Buffer.from('image-content'), { filename: 'cover.webp', contentType: 'image/webp' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      originalName: 'cover.webp',
      mimeType: 'image/webp',
      purpose: 'CONTENT_IMAGE',
    });
    expect(response.body.data.publicUrl).toContain('/uploads/');
    expect(response.body.data.storagePath).toBeUndefined();
  });
});
