import request = require('supertest');

import { createTestApp } from '../support/test-app';

describe('traffic limits', () => {
  it('rejects excessive login requests with a public-safe envelope', async () => {
    process.env.LOGIN_LIMIT = '1';
    const { app } = await createTestApp();

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong-password' })
      .expect(401);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong-password' })
      .expect(429);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Too many requests. Please try again later.',
      errors: [],
    });

    await app.close();
  });
});
