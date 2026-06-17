import request = require('supertest');

import { createTestApp, TestAppContext } from '../support/test-app';

describe('health readiness', () => {
  let context: TestAppContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await context.app.close();
  });

  it('reports API, database, Redis, environment, and timestamp readiness', async () => {
    const response = await request(context.app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Health status retrieved',
      data: {
        status: 'ready',
        environment: 'test',
        checks: {
          api: 'ready',
          database: 'ready',
          cache: 'ready',
        },
      },
    });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
  });
});
