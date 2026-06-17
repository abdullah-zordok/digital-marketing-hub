import request = require('supertest');

import { createTestApp } from '../support/test-app';

describe('production health contract', () => {
  it('returns ready health output without secrets', async () => {
    const { app } = await createTestApp();

    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

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
    expect(JSON.stringify(response.body)).not.toMatch(/postgres:postgres|JWT_SECRET|token|password/i);

    await app.close();
  });

  it('returns not-ready health output when a dependency is unavailable', async () => {
    const { app } = await createTestApp({ redisReady: false });

    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(503);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Service is not ready',
      data: {
        status: 'not_ready',
        checks: {
          api: 'ready',
          cache: 'not_ready',
        },
      },
    });

    await app.close();
  });
});
