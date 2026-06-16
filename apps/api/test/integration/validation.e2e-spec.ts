import request = require('supertest');

import { createTestApp, TestAppContext } from '../support/test-app';

describe('request validation', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('rejects malformed login input with the standard error envelope', async () => {
    const response = await request(context.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Validation failed',
    });
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    );
  });
});
