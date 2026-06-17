import request = require('supertest');

import { createTestApp } from '../support/test-app';

jest.setTimeout(30_000);

describe('API documentation contract', () => {
  it('exposes API documentation and generated route coverage when enabled', async () => {
    process.env.DOCS_ENABLED = 'true';
    const { app } = await createTestApp();

    await request(app.getHttpServer()).get('/api/docs').expect(200);
    const documentResponse = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    const documentedPaths = Object.keys(documentResponse.body.paths);

    expect(documentedPaths).toEqual(
      expect.arrayContaining([
        '/api/v1/auth/login',
        '/api/v1/services',
        '/api/v1/blog/posts',
        '/api/v1/leads',
        '/api/v1/chatbot/sessions',
        '/api/v1/admin/uploads',
        '/api/v1/admin/analytics/overview',
        '/api/v1/health',
      ]),
    );

    await app.close();
  });
});
