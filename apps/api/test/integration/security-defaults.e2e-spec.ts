import request = require('supertest');

import { createTestApp } from '../support/test-app';

describe('security defaults', () => {
  it('allows trusted CORS origins and applies security headers', async () => {
    const { app } = await createTestApp();

    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['x-content-type-options']).toBe('nosniff');

    await app.close();
  });

  it('does not allow untrusted CORS origins', async () => {
    const { app } = await createTestApp();

    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'https://untrusted.example.com')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();

    await app.close();
  });
});
